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
