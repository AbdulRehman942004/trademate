import axiosInstance from "@/lib/axiosInstance";
import type {
  RouteEvaluationRequest,
  RouteEvaluationResponse,
  RouteOptions,
} from "@/types/routes";

const RouteService = {
  getOptions: async (): Promise<RouteOptions> => {
    const { data } = await axiosInstance.get<RouteOptions>("/v1/routes/options");
    return data;
  },

  evaluate: async (body: RouteEvaluationRequest): Promise<RouteEvaluationResponse> => {
    const { data } = await axiosInstance.post<RouteEvaluationResponse>(
      "/v1/routes/evaluate",
      body
    );
    return data;
  },
};

export default RouteService;
