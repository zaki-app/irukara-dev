export interface BodyParams {
  key: string;
  prompt: string;
  negative_prompt: string | null; // 画像に写らせたくないアイテム
  width: number;
  height: number;
  samples: number; // 出力される画像数
  num_inference_steps: number; // ノイズ除去。21, 31, 41, 51のみ使用
  seed: string | null; // 同じ結果を再現するために使用される
  guidance_scale: number; // ガイダンススケール 1~20までの数字
  safety_checker?: string; // 該当した画像が検出されたら空白の画像になる
  multi_lingual: string; // 他言語対応
  panorama?: string; // パノラマ画像を生成するか否か
  self_attention?: string; // 高品質が必要か。必要な場合生成時間がかかる
  upscale?: string; // 指定された画像解像度を 2 倍 (2x) にアップスケールする場合
  embeddings_model?: string | null; // 埋め込みモデル
  webhook: string | null;
  track_id: string | null;
  // AnythingV4
  model_id?: string;
  // real
  enhance_prompt?: string;
}

// AnythingV4のレスポンス
export interface AnythingV4Response {
  status: string;
  generationTime: number;
  id: number;
  output: string[];
  meta: {
    prompt: string;
    model_id: string;
    negative_prompt: string;
    scheduler: string;
    safety_checker: string;
    W: number;
    H: number;
    guidance_scale: number;
    seed: number;
    steps: number;
    n_samples: number;
    full_url: string;
    tomesd: string;
    upscale: string;
    multi_lingual: string;
    panorama: string;
    self_attention: string;
    use_karras_sigmas: string;
    embeddings: null;
    vae: null;
    lora: null;
    lora_strength: string;
    clip_skip: 1;
    temp: string;
    base64: string;
    file_prefix: string;
  };
}

export interface ImageSaveProps {
  imageId: string;
  hashUserId: string;
  prompt: string;
  imageUrl: string;
  mode: number;
  createdAt: number;
}

// イメージテーブル
export interface SaveImageType {
  imageId: string;
  userId: string;
  shareStatus: number;
  prompt: string;
  imageUrl: string;
  referenceType: number;
  good: number;
  mode: number;
  memberStatus: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}
