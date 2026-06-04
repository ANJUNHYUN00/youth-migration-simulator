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

  // AI 요약 — Claude 호출 시도, 실패 시 폴백
  const fromClaude = await claudeSummary(
    residence,
    missions,
    completedIds,
    relationshipScore
  );
  const aiSummary =
    fromClaude ?? templateSummary(residence, infoScore, relationshipScore);
  const aiSummarySource: "claude" | "template" = fromClaude ? "claude" : "template";

  // 타임라인 — 완료 순서 + 일차 매핑
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
