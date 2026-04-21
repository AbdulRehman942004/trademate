import axiosInstance from "@/lib/axiosInstance";

export interface RatingResponse {
  message_id: number;
  rating: number;
}

const MessageService = {
  rateMessage: async (messageId: number, rating: number): Promise<RatingResponse> => {
    const { data } = await axiosInstance.patch<RatingResponse>(
      `/v1/messages/${messageId}/rating`,
      { rating }
    );
    return data;
  },
};

export default MessageService;
