"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import type {
  AcceptedRun,
  ApplicantList,
  ApplicationStage,
  ResumeDiff,
  ResumeVersionSummary,
} from "@/lib/api/types";

export function useResumeVersions(resumeId: string) {
  const api = useApi();
  return useQuery({
    queryKey: [...queryKeys.resumes(), resumeId, "versions"],
    queryFn: () => api<ResumeVersionSummary[]>(`/v1/resumes/${resumeId}/versions`),
  });
}

export function useResumeDiff(versionId: string | null) {
  const api = useApi();
  return useQuery({
    queryKey: queryKeys.resumeVersion(versionId ?? "none"),
    queryFn: () => api<ResumeDiff>(`/v1/resume-versions/${versionId}/diff`),
    enabled: Boolean(versionId),
  });
}

export function useTailor(resumeId: string) {
  const api = useApi();
  return useMutation({
    mutationFn: (body: { job_id?: string; job_description_raw?: string }) =>
      api<AcceptedRun>(`/v1/resumes/${resumeId}/tailor`, {
        method: "POST",
        body,
        // Re-posting a tailor request costs real money; the key makes a double-click free.
        idempotencyKey: crypto.randomUUID(),
      }),
  });
}

export function useApproveVersion(resumeId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      api<{ id: string; approved_at: string }>(
        `/v1/resume-versions/${versionId}/approve`,
        { method: "POST" },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.resumes(), resumeId, "versions"],
      }),
  });
}

export function useApplicants(
  jobId: string,
  params: { sort: "rank" | "recent"; stage?: ApplicationStage },
) {
  const api = useApi();
  const search = new URLSearchParams({ sort: params.sort });
  if (params.stage) search.set("stage", params.stage);

  return useQuery({
    queryKey: queryKeys.applicants(jobId, params),
    queryFn: () => api<ApplicantList>(`/v1/jobs/${jobId}/applications?${search}`),
    // Rows reorder progressively while a rank run is in flight.
    refetchInterval: (query) => (query.state.data?.ranked === false ? 3000 : false),
  });
}

export function useRankApplicants(jobId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<AcceptedRun>(`/v1/jobs/${jobId}/rank`, {
        method: "POST",
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["job", jobId, "applications"] }),
  });
}

export function useChangeStage(jobId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, stage }: { applicationId: string; stage: ApplicationStage }) =>
      api<{ id: string; stage: ApplicationStage }>(
        `/v1/applications/${applicationId}/stage`,
        { method: "PATCH", body: { stage } },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["job", jobId, "applications"] }),
  });
}
