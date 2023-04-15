/**
 * LINEBOTのwebhookEvent
 */
export class LineBotReqEventDto {
  type: string;
  message?: {
    type: string;
    id: string;
    text: string;
  };
  postback?: {
    data: string;
  };
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
  timestamp: number;
  source: {
    type: string;
    userId: string;
  };
  replyToken: string;
  mode: string;
}

/**
 * 返却するリプライメッセージ
 */
export class ReturnReplyMsgDto {
  type: string;
  text: string;
  quickReply: {
    items: [];
  };
}
