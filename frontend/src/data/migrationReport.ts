// 이주 리포트 (시네마틱 엔딩) — 생성·캐싱·AI 요약 헬퍼
//
// 마지막 일차 의식 직후 호출되어 RegionRecord.migrationReport에 저장된다.
// AI 요약은 VITE_ANTHROPIC_API_KEY가 있으면 Claude 호출, 없거나 실패 시 템플릿 폴백.

import type { Mission } from "./missions";
import type { Residence } from "./residences";
import type { LifeStyleType } from "./residences";
import type { MigrationReport, RegionRecord } from "./journey";
import { calculateMatch } from "./journey";
import { buildDayPlan } from "./dayPlan";

// =====================================================================
// 정적 템플릿 — AI 호출 실패/미설정 시 폴백
// =====================================================================

function templateSummary(
  residence: Residence,
  doneMissionCount: number,
  match: number
): string {
  const region = residence.region;
  const lines: string[] = [];

  if (match >= 85) {
    lines.push(
      `${region}에서의 ${doneMissionCount}개 미션을 끝내고 보니, 당신과 이 동네가 닮아 있다는 게 또렷이 보여요.`
    );
  } else if (match >= 70) {
    lines.push(
      `${region}에서의 시간이 차곡차곡 쌓였어요. 어떤 흐름은 익숙하고 또 어떤 흐름은 새로웠을 거예요.`
    );
  } else {
    lines.push(
      `${region}을 두루 둘러본 시간이었어요. 잘 맞는 부분과 어색한 부분, 둘 다 분명해졌을 거예요.`
    );
  }

  lines.push("당신이 그려본 이 동네에서의 미래, 부디 오래 마음에 남기를.");
  return lines.join("\n");
}

// =====================================================================
// Claude API 호출 (브라우저에서 직접 — 데모용)
// =====================================================================
// 실제 운영에서는 백엔드 프록시 권장. 데모이므로 ENV에 키 있으면 직접 호출.

async function claudeSummary(
  residence: Residence,
  missions: Mission[],
  completedIds: Set<string>,
  match: number
): Promise<string | null> {
  const apiKey = (import.meta as unknown as { env?: { VITE_ANTHROPIC_API_KEY?: string } }).env
    ?.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const completedTitles = missions
    .filter((m) => completedIds.has(m.id))
    .map((m) => m.title);

  const prompt = `사용자가 ${residence.region}(${residence.name})에서 가상 이주 시뮬레이션을 마쳤습니다.

완료한 미션 (${completedTitles.length}개):
${completedTitles.map((t) => `- ${t}`).join("\n")}

이 지역과의 적합도: ${match}/100점

위 정보를 바탕으로 사용자에게 따뜻하고 격려하는 2~3문장 요약을 만들어주세요.
- 청풍 서비스는 "이주 결정 도구"가 아니라 "지역과 관계 쌓고 미래를 그려보는 시뮬레이션"입니다
- "쌓이다·만나다·상상하다·머무르다" 같은 어휘를 우선 사용
- 점수·등수 같은 평가가 아니라 사용자가 이 지역에서 어떤 시간을 보냈는지 회상하는 톤
- 1인칭 사용자 시점(당신은…) 으로 작성
- 마크다운 없이 일반 텍스트로`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

// =====================================================================
// 본문 요약 — NPC가 알려준 '정보' + 사용자가 거친 미션을 엮은 4~6문장 글
// =====================================================================

// 미션에서 사용자가 만나거나 알게 됐을 만한 '정보 조각' 추출.
// dialogues[].npc 텍스트를 첫 turn 위주로 발췌해 Claude 프롬프트의 컨텍스트로 씀.
function extractMissionFacts(missions: Mission[], completedIds: Set<string>) {
  return missions
    .filter((m) => completedIds.has(m.id))
    .map((m) => {
      const firstNpcLines = (m.dialogues ?? [])
        .slice(0, 2)
        .map((t) => t.npc.replace(/\{amount\}|\{compare\}/g, "").trim())
        .filter((s) => s.length > 0)
        .join(" ");
      return {
        title: m.title,
        category: m.category,
        npcName: m.npc.name,
        excerpt: firstNpcLines.slice(0, 180),
      };
    });
}

// 정적 폴백 — Claude 미설정/실패 시 사용
function templateNarrative(
  residence: Residence,
  facts: ReturnType<typeof extractMissionFacts>
): string {
  const region = residence.region;
  if (facts.length === 0) {
    return `${region}에서의 시간은 시작도 채 못 했지만, 떠나본 것만으로도 마음에 무언가 자리잡았어요.`;
  }
  const npcsMet = Array.from(new Set(facts.map((f) => f.npcName))).slice(0, 3);
  const npcLine =
    npcsMet.length === 1
      ? `${npcsMet[0]}을(를) 만난 게 인상에 남아요.`
      : npcsMet.length >= 2
      ? `${npcsMet.slice(0, -1).join(", ")} 그리고 ${
          npcsMet[npcsMet.length - 1]
        }까지, 그 만남들이 동네의 결을 보여줬어요.`
      : "";
  const themes = Array.from(new Set(facts.map((f) => f.category))).slice(0, 3);
  const themeLine =
    themes.length > 0
      ? `${themes.join(", ")}으로 이어진 시간이 동네의 결을 한 겹씩 보여줬어요.`
      : "";

  return [
    `${region}에서의 ${facts.length}개 미션이 차곡차곡 쌓였어요.`,
    npcLine,
    themeLine,
    "거기서 보고 들은 것들이 당신 안에 한 자리 잡았기를.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// Claude 호출 — 본문 글 1편 (4~6문장)
async function claudeNarrative(
  residence: Residence,
  facts: ReturnType<typeof extractMissionFacts>,
  match: number
): Promise<string | null> {
  const apiKey = (import.meta as unknown as { env?: { VITE_ANTHROPIC_API_KEY?: string } }).env
    ?.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  if (facts.length === 0) return null;

  const factsBlock = facts
    .map(
      (f, i) =>
        `${i + 1}. ${f.title} (${f.category}) — ${f.npcName}: "${f.excerpt}"`
    )
    .join("\n");

  const prompt = `사용자가 ${residence.region}(${residence.name})에서 가상 이주 시뮬레이션을 마쳤습니다.
이 지역과의 적합도: ${match}/100점

사용자가 거친 미션과 그곳에서 만난 주민이 들려준 정보 요약:
${factsBlock}

위 내용을 바탕으로, 사용자가 ${residence.region}에서 보낸 시간을 회상하는 4~6문장 글을 한 편 써주세요.
- 청풍 서비스는 "이주 결정 도구"가 아니라 "지역과 관계 쌓고 미래를 그려보는 시뮬레이션"입니다
- 점수·등수 평가 어휘 금지. "쌓이다·만나다·머무르다·자리잡다·그려보다" 같은 어휘 우선
- 미션에서 알게 된 구체적 정보(가격·거리·만난 사람 이름·풍경 등)를 1~2개 자연스럽게 인용
- 1인칭 사용자 시점("당신은…")
- 마크다운/제목/리스트 금지. 단락 구분만 빈 줄로.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return text || null;
  } catch {
    return null;
  }
}

// =====================================================================
// 리포트 생성
// =====================================================================

export async function generateMigrationReport(
  residence: Residence,
  record: RegionRecord,
  missions: Mission[],
  lifestyle: LifeStyleType | null
): Promise<MigrationReport> {
  const completedIds = new Set(record.completedMissionIds);
  const infoScore = completedIds.size;
  const accumulationScore = record.score;
  const relationshipScore = calculateMatch(lifestyle, residence, record);

  // AI 짧은 요약 (Slide 2) — Claude 호출 시도, 실패 시 폴백
  const fromClaudeSummary = await claudeSummary(
    residence,
    missions,
    completedIds,
    relationshipScore
  );
  const aiSummary =
    fromClaudeSummary ?? templateSummary(residence, infoScore, relationshipScore);
  const aiSummarySource: "claude" | "template" = fromClaudeSummary
    ? "claude"
    : "template";

  // AI 본문 요약 (Slide 3) — 미션 NPC 정보 발췌해서 Claude로 4~6문장 글 생성
  const facts = extractMissionFacts(missions, completedIds);
  const fromClaudeNarrative = await claudeNarrative(
    residence,
    facts,
    relationshipScore
  );
  const narrativeBody =
    fromClaudeNarrative ?? templateNarrative(residence, facts);
  const narrativeBodySource: "claude" | "template" = fromClaudeNarrative
    ? "claude"
    : "template";

  // 타임라인 — 완료 순서 + 일차 매핑 (옛 슬라이드 호환용)
  const { missionsByDay } = buildDayPlan(residence, missions);
  const dayOf = (missionId: string): number => {
    for (let i = 0; i < missionsByDay.length; i++) {
      if (missionsByDay[i].includes(missionId)) return i + 1;
    }
    return 1;
  };
  const timeline = record.completedMissionIds.map((id) => ({
    missionId: id,
    day: dayOf(id),
  }));

  return {
    generatedAt: new Date().toISOString(),
    infoScore,
    accumulationScore,
    relationshipScore,
    aiSummary,
    aiSummarySource,
    narrativeBody,
    narrativeBodySource,
    timeline,
    hasBeenViewed: false,
  };
}

// 시청 완료 표시 (cache 보존, 다음 진입 시 자유 탐색 모드)
export function markReportViewed(
  progress: Record<string, RegionRecord>,
  residenceId: string
): Record<string, RegionRecord> {
  const rec = progress[residenceId];
  if (!rec?.migrationReport) return progress;
  return {
    ...progress,
    [residenceId]: {
      ...rec,
      migrationReport: { ...rec.migrationReport, hasBeenViewed: true },
    },
  };
}

// 리포트 저장
export function saveReport(
  progress: Record<string, RegionRecord>,
  residenceId: string,
  report: MigrationReport
): Record<string, RegionRecord> {
  const rec = progress[residenceId];
  if (!rec) return progress;
  return {
    ...progress,
    [residenceId]: { ...rec, migrationReport: report },
  };
}
