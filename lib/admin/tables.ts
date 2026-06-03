// 管理画面のスキーマ定義（microCMS スキーマ準拠・0003_full_schema.sql と対応）。
// ここのフィールド定義が一覧・フォーム・保存処理（型変換）すべての源になる。
// DB 列は snake_case。

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "boolean"
  | "csv" // カンマ区切り → text[]
  | "json" // 生 JSON → jsonb
  | "number"
  | "image" // Storage 画像（ファイル選択 → 公開URL）。保存値は text(URL)
  | "imagelist" // 複数画像（ファイル選択を行追加）。保存値は text[]
  | "repeater" // 行の追加/削除ができる専用UI → jsonb 配列

/** repeater の行内サブ項目（テキストエリア廃止のため専用UIで使う） */
export type SubFieldType =
  | "text"
  | "textarea"
  | "number"
  | "image"
  | "select"
  | "repeater"

export type SubField = {
  name: string
  label: string
  type: SubFieldType
  options?: string[] // select 用
  placeholder?: string
  itemFields?: SubField[] // ネスト repeater 用
  /** type:"image" で複数枚アップロードを許可（行内 jsonb に URL 配列で保存）。 */
  multiple?: boolean
}

export type Field = {
  name: string // DB 列名
  label: string // 表示ラベル（日本語）
  type: FieldType
  required?: boolean
  options?: string[] // select 用（保存される値）
  optionLabels?: Record<string, string> // select の表示ラベル（値→日本語表示）
  placeholder?: string
  help?: string
  itemFields?: SubField[] // repeater 用の行スキーマ
  /** type:"image" で複数枚アップロードを許可（保存は URL の配列 → text[]）。
   *  メインビジュアル/サムネイル等の1枚画像では指定しない。 */
  multiple?: boolean
}

export type TableConfig = {
  key: string // ルート & DB テーブル名
  label: string // 日本語名
  fields: Field[]
  listColumns: string[] // 一覧に出す列
  titleField: string // 行の代表表示に使う列
}

export const TABLES: Record<string, TableConfig> = {
  lives: {
    key: "lives",
    label: "ライブ",
    titleField: "title",
    listColumns: ["title", "live_type", "status"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true, placeholder: "anniv-tour-2026" },
      { name: "title", label: "タイトル", type: "text", required: true },
      {
        name: "live_type",
        label: "ライブ種別",
        type: "select",
        options: ["ワンマン", "対バン", "フェス", "配信ライブ", "イベント出演", "その他"],
      },
      { name: "status", label: "ステータス", type: "select", options: ["coming", "ongoing", "finished"], required: true },
      { name: "period_start", label: "開始日時", type: "text", placeholder: "2026-06-04 もしくは 2026-06-04T18:00", help: "ISO形式（datetime）" },
      { name: "period_end", label: "終了日時", type: "text", placeholder: "2026-06-06" },
      { name: "key_visual", label: "キービジュアル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "members", label: "出演メンバーID（カンマ区切り）", type: "csv", placeholder: "rinu, root" },
      { name: "hashtag", label: "ハッシュタグ", type: "text", placeholder: "#すとぷり10th" },
      { name: "description", label: "説明", type: "textarea" },
      { name: "note", label: "備考", type: "textarea" },
      {
        name: "venues",
        label: "会場公演",
        type: "repeater",
        itemFields: [
          { name: "venueName", label: "会場名", type: "text" },
          { name: "stageName", label: "ステージ名", type: "text" },
          { name: "prefecture", label: "都道府県", type: "text" },
          { name: "areaMapImage", label: "会場MAP画像", type: "image" },
          {
            name: "shows",
            label: "公演リスト",
            type: "repeater",
            itemFields: [
              { name: "date", label: "公演日", type: "text", placeholder: "2026-06-04" },
              { name: "partLabel", label: "部", type: "text", placeholder: "昼の部" },
              { name: "scheduleText", label: "スケジュール", type: "text", placeholder: "開場16:00/開演17:00" },
            ],
          },
          {
            name: "venueGoods",
            label: "会場グッズ販売情報",
            type: "repeater",
            itemFields: [
              { name: "venueName", label: "会場名/ブース名", type: "text" },
              { name: "saleSchedule", label: "販売日時", type: "textarea" },
              { name: "ticketInfo", label: "整理券の有無・申込方法", type: "textarea" },
              { name: "ticketPeriod", label: "整理券申込期間", type: "text" },
              { name: "payment", label: "決済方法", type: "text" },
              { name: "note", label: "備考", type: "textarea" },
              { name: "goodsImages", label: "物販画像（複数）", type: "image", multiple: true },
            ],
          },
          { name: "setlistNotes", label: "セトリ変更メモ", type: "textarea" },
        ],
      },
      {
        name: "ticket_lineup",
        label: "チケットラインナップ",
        type: "repeater",
        itemFields: [
          { name: "ticketName", label: "チケット名", type: "text" },
          { name: "price", label: "価格", type: "text", placeholder: "¥9,000" },
        ],
      },
      {
        name: "ticket_info",
        label: "チケット情報",
        type: "repeater",
        itemFields: [
          { name: "ticketType", label: "種別", type: "text", placeholder: "一般 / FC先行" },
          { name: "salePeriod", label: "販売期間", type: "text" },
          { name: "price", label: "価格", type: "text" },
          { name: "method", label: "販売方式", type: "text", placeholder: "抽選 / 先着" },
          { name: "purchaseUrl", label: "購入URL", type: "text" },
          { name: "status", label: "ステータス", type: "text", placeholder: "受付中 / 受付終了" },
        ],
      },
      {
        name: "goods_info",
        label: "物販情報",
        type: "repeater",
        itemFields: [
          { name: "saleType", label: "販売種別", type: "text" },
          { name: "image", label: "画像（複数）", type: "image", multiple: true },
          { name: "salePeriod", label: "受付期間", type: "text" },
          { name: "deliveryInfo", label: "配送情報", type: "text" },
          { name: "info", label: "詳細", type: "textarea" },
          { name: "purchaseUrl", label: "購入URL", type: "text" },
        ],
      },
      {
        name: "ppv_info",
        label: "配信(PPV)情報",
        type: "repeater",
        itemFields: [
          { name: "platform", label: "プラットフォーム", type: "text" },
          { name: "viewingPeriod", label: "視聴期間", type: "text" },
          { name: "price", label: "価格", type: "text" },
          { name: "purchaseUrl", label: "購入URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      {
        name: "live_viewing",
        label: "ライブビューイング",
        type: "repeater",
        itemFields: [
          { name: "title", label: "LV名称", type: "text" },
          { name: "screeningDate", label: "上映日時", type: "text" },
          { name: "price", label: "価格", type: "text" },
          { name: "theatersUrl", label: "劇場一覧URL", type: "text" },
          { name: "purchaseUrl", label: "購入URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      { name: "fc_info", label: "FC情報 画像", type: "image", multiple: true },
      { name: "upgrade_goods_info", label: "アップグレード物販 画像", type: "image", multiple: true },
      { name: "goods_images", label: "ライブグッズ画像（複数）", type: "image", multiple: true },
      {
        name: "setlist",
        label: "セットリスト",
        type: "repeater",
        itemFields: [
          { name: "trackNumber", label: "曲番号", type: "number" },
          { name: "title", label: "曲名", type: "text" },
          { name: "memo", label: "備考", type: "text" },
        ],
      },
      { name: "official_site_url", label: "公式サイトURL", type: "text" },
      { name: "official_playlist_url", label: "公式プレイリストURL", type: "text" },
      { name: "official_report_url", label: "公式レポートURL", type: "text" },
      { name: "unofficial_report_url", label: "非公式レポートURL", type: "text" },
      { name: "related_lives", label: "関連ライブ（スラッグ・カンマ区切り）", type: "csv" },
      { name: "related_albums", label: "関連アルバム（スラッグ・カンマ区切り）", type: "csv" },
      { name: "related_events", label: "関連イベント（スラッグ・カンマ区切り）", type: "csv" },
      { name: "has_report", label: "レポートあり", type: "boolean" },
      { name: "report_published_at", label: "レポート公開日時", type: "text", placeholder: "2026-06-10" },
      { name: "report_lead_title", label: "レポート見出し", type: "text" },
      { name: "report_content", label: "レポート本文", type: "textarea" },
      { name: "report_thumbnail", label: "レポートサムネイル画像", type: "image" },
      { name: "report_gallery", label: "レポートギャラリー 画像URL（改行/カンマ区切り）", type: "textarea" },
      { name: "is_10th", label: "10周年関連", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  goods: {
    key: "goods",
    label: "グッズ",
    titleField: "title",
    listColumns: ["title", "product_type", "release_date"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true },
      { name: "title", label: "タイトル", type: "text", required: true },
      {
        name: "product_type",
        label: "商品種別",
        type: "select",
        required: true,
        options: ["グッズ", "アクリル", "缶バッジ", "ぬいぐるみ", "アパレル", "CD・DVD", "ブロマイド", "その他"],
      },
      {
        name: "sale_type",
        label: "販売形態",
        type: "select",
        options: ["通常販売", "受注生産", "数量限定", "抽選販売", "事後通販", "その他"],
      },
      { name: "release_date", label: "発売日", type: "date" },
      { name: "sale_period", label: "販売期間（自由文字列）", type: "text", placeholder: "2026/06/04〜2026/06/30" },
      { name: "price", label: "価格", type: "text", placeholder: "¥1,500" },
      { name: "key_visual", label: "キービジュアル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "lineup_images", label: "ラインナップ画像", type: "image", multiple: true },
      { name: "purchase_url", label: "購入URL", type: "text" },
      { name: "delivery_info", label: "配送情報", type: "textarea" },
      { name: "related_live", label: "関連ライブ（スラッグ）", type: "text", placeholder: "anniv-tour-2026" },
      { name: "description", label: "説明", type: "textarea" },
      { name: "member_ids", label: "関連メンバーID（カンマ区切り）", type: "csv", placeholder: "rinu, root" },
      { name: "is_active", label: "公開（有効）", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  events: {
    key: "events",
    label: "イベント",
    titleField: "title",
    listColumns: ["title", "event_type", "period_start"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true },
      { name: "title", label: "タイトル", type: "text", required: true },
      {
        name: "event_type",
        label: "イベント種別",
        type: "text",
        required: true,
        placeholder: "総合イベント / コラボカフェ / キャンペーン 等（自由入力）",
      },
      {
        name: "collab_partner",
        label: "コラボ先",
        type: "text",
        placeholder: "コラボ相手・ブランド/作品名 等",
        help: "入力するとカード・詳細ページに目立つ形で表示されます。",
      },
      { name: "is_ongoing", label: "開催中（継続中）", type: "boolean" },
      { name: "period_start", label: "開始日（文字列）", type: "text", placeholder: "2026-06-04 もしくは 2026年6月4日" },
      { name: "period_end", label: "終了日（文字列）", type: "text" },
      { name: "key_visual", label: "キービジュアル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "url", label: "公式サイトURL", type: "text" },
      { name: "hashtag", label: "ハッシュタグ", type: "text", placeholder: "#すとぷり10th" },
      { name: "parent_event", label: "親イベント（スラッグ）", type: "text" },
      { name: "description", label: "説明", type: "textarea" },
      { name: "member_ids", label: "関連メンバーID（カンマ区切り）", type: "csv" },
      { name: "related_lives", label: "関連ライブ（スラッグ・カンマ区切り）", type: "csv" },
      { name: "related_albums", label: "関連アルバム（スラッグ・カンマ区切り）", type: "csv" },
      { name: "related_songs", label: "関連楽曲（スラッグ・カンマ区切り）", type: "csv" },
      {
        name: "store_info",
        label: "店舗情報",
        type: "repeater",
        itemFields: [
          { name: "storeName", label: "店舗名", type: "text" },
          { name: "storeType", label: "店舗タイプ", type: "text", placeholder: "コラボカフェ 等" },
          { name: "prefecture", label: "都道府県", type: "text" },
          { name: "address", label: "住所", type: "text" },
          { name: "periodText", label: "期間", type: "text" },
          { name: "mapImage", label: "マップ画像", type: "image" },
          { name: "reservationUrl", label: "予約URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      {
        name: "menu_info",
        label: "メニュー情報",
        type: "repeater",
        itemFields: [
          { name: "menuName", label: "メニュー名", type: "text" },
          { name: "image", label: "画像", type: "image", multiple: true },
          { name: "info", label: "補足", type: "text" },
          { name: "description", label: "説明", type: "textarea" },
        ],
      },
      {
        name: "goods_info",
        label: "グッズ販売",
        type: "repeater",
        itemFields: [
          { name: "goodsName", label: "商品名", type: "text" },
          { name: "image", label: "画像", type: "image", multiple: true },
          { name: "salePeriod", label: "販売期間", type: "text" },
          { name: "purchaseUrl", label: "購入URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      {
        name: "broadcast_info",
        label: "配信情報",
        type: "repeater",
        itemFields: [
          { name: "broadcastTitle", label: "配信タイトル", type: "text" },
          { name: "broadcastDate", label: "配信日時", type: "text" },
          { name: "platform", label: "プラットフォーム", type: "text" },
          { name: "streamUrl", label: "配信URL", type: "text" },
          { name: "info", label: "補足", type: "text" },
          { name: "image", label: "画像", type: "image" },
        ],
      },
      {
        name: "post_schedule",
        label: "投稿スケジュール",
        type: "repeater",
        itemFields: [
          { name: "postDate", label: "日付", type: "text" },
          { name: "postTheme", label: "タイトル", type: "text" },
          { name: "postUrl", label: "投稿URL", type: "text" },
          { name: "thumbnail", label: "サムネイル", type: "image" },
          { name: "info", label: "補足", type: "text" },
        ],
      },
      {
        name: "campaign_info",
        label: "キャンペーン情報",
        type: "repeater",
        itemFields: [
          { name: "campaignName", label: "キャンペーン名", type: "text" },
          { name: "entryMethod", label: "応募方法", type: "text" },
          { name: "entryPeriod", label: "応募期間", type: "text" },
          { name: "prize", label: "賞品", type: "text" },
          { name: "announceDate", label: "当選発表日", type: "text" },
          { name: "entryUrl", label: "応募URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      {
        name: "media_info",
        label: "メディア出演",
        type: "repeater",
        itemFields: [
          { name: "mediaName", label: "媒体名", type: "text" },
          { name: "programName", label: "番組名", type: "text" },
          { name: "mediaType", label: "媒体タイプ", type: "text", placeholder: "TV / ラジオ / WEB" },
          { name: "airDate", label: "放送日", type: "text" },
          { name: "url", label: "関連URL", type: "text" },
          { name: "info", label: "補足", type: "textarea" },
        ],
      },
      {
        name: "episodes",
        label: "エピソード",
        type: "repeater",
        itemFields: [
          { name: "episodeNumber", label: "回数", type: "number" },
          { name: "episodeTitle", label: "タイトル", type: "text" },
          { name: "airDate", label: "放送日", type: "text" },
          { name: "guests", label: "ゲスト", type: "text" },
          { name: "summary", label: "概要", type: "textarea" },
          { name: "thumbnail", label: "サムネイル", type: "image" },
          { name: "archiveUrl", label: "アーカイブURL", type: "text" },
          { name: "info", label: "補足", type: "text" },
        ],
      },
      {
        name: "tournament_info",
        label: "大会・コンテスト",
        type: "repeater",
        itemFields: [
          { name: "sectionTitle", label: "セクション見出し", type: "text" },
          { name: "image", label: "画像", type: "image" },
          { name: "content", label: "説明", type: "textarea" },
        ],
      },
      {
        name: "custom_section",
        label: "カスタムセクション",
        type: "repeater",
        itemFields: [
          { name: "sectionTitle", label: "セクションタイトル", type: "text" },
          { name: "content", label: "内容", type: "textarea" },
          { name: "image", label: "画像", type: "image", multiple: true },
        ],
      },
      { name: "is_active", label: "公開（有効）", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  songs: {
    key: "songs",
    label: "楽曲",
    titleField: "title",
    listColumns: ["title", "type", "published_date"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true },
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "artist", label: "アーティスト", type: "text", placeholder: "すとぷり / 莉犬 等" },
      { name: "type", label: "種別", type: "select", required: true, options: ["ORIGINAL", "Cover"] },
      { name: "published_date", label: "公開日（文字列）", type: "text", placeholder: "2026-06-04 もしくは 2026年6月4日" },
      { name: "duration", label: "再生時間", type: "text", placeholder: "3:45" },
      { name: "genre", label: "ジャンル", type: "text" },
      { name: "youtube_id", label: "YouTube動画ID", type: "text", placeholder: "v= 以降のID" },
      { name: "youtube_url", label: "YouTube URL（フル）", type: "text", placeholder: "https://youtu.be/xxxx" },
      { name: "streaming_url", label: "ストリーミングURL", type: "text" },
      { name: "album_slug", label: "所属アルバムのスラッグ", type: "text" },
      { name: "lyrics", label: "歌詞", type: "textarea" },
      { name: "credit", label: "クレジット", type: "textarea" },
      { name: "member_ids", label: "関連メンバーID（カンマ区切り）", type: "csv" },
      { name: "description", label: "説明", type: "textarea" },
      { name: "is_active", label: "公開（有効）", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  albums: {
    key: "albums",
    label: "アルバム",
    titleField: "title",
    listColumns: ["title", "album_type", "release_date"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true },
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "artist", label: "アーティスト", type: "text", placeholder: "すとぷり 等" },
      { name: "album_type", label: "形態", type: "text", placeholder: "アルバム / シングル / ミニアルバム 等" },
      { name: "release_date", label: "発売日", type: "date" },
      { name: "total_duration", label: "総再生時間", type: "text", placeholder: "45:30" },
      { name: "label", label: "レーベル", type: "text" },
      { name: "cover", label: "カバー画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "summary_image", label: "概要画像", type: "image" },
      { name: "purchase_url", label: "購入URL", type: "text" },
      { name: "streaming_url", label: "ストリーミングURL", type: "text" },
      { name: "xfd_url", label: "試聴（XFD）URL", type: "text" },
      {
        name: "tracks",
        label: "収録曲",
        type: "repeater",
        itemFields: [
          { name: "trackNumber", label: "トラック番号", type: "number" },
          { name: "songSlug", label: "楽曲slug", type: "text", placeholder: "song-slug" },
        ],
      },
      {
        name: "editions",
        label: "形態・盤違い",
        type: "repeater",
        itemFields: [
          { name: "editionName", label: "形態名", type: "text", placeholder: "初回限定盤" },
          { name: "catalog", label: "品番", type: "text" },
          { name: "price", label: "価格", type: "text" },
          { name: "spec", label: "仕様", type: "text", placeholder: "CD+DVD" },
          { name: "cover", label: "ジャケット画像", type: "image" },
        ],
      },
      {
        name: "bonuses",
        label: "特典",
        type: "repeater",
        itemFields: [
          { name: "store", label: "販売店", type: "text" },
          { name: "bonusName", label: "特典名", type: "text" },
          { name: "bonusImage", label: "特典画像", type: "image" },
        ],
      },
      { name: "description", label: "説明", type: "textarea" },
      { name: "is_active", label: "公開（有効）", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  magazines: {
    key: "magazines",
    label: "雑誌",
    titleField: "name",
    listColumns: ["name", "issue", "release_date"],
    fields: [
      { name: "name", label: "雑誌名", type: "text", required: true },
      { name: "issue", label: "号", type: "text", placeholder: "2026年7月号" },
      { name: "release_date", label: "発売日", type: "date" },
      { name: "publisher", label: "出版社", type: "text" },
      { name: "content", label: "内容", type: "textarea", placeholder: "表紙・巻頭特集 等" },
      { name: "image", label: "表紙画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "images", label: "画像ギャラリー（複数）", type: "image", multiple: true },
      {
        name: "status",
        label: "発売ステータス",
        type: "select",
        options: ["released", "upcoming"],
        optionLabels: { released: "発売済み", upcoming: "発売予定" },
      },
      { name: "url", label: "URL", type: "text" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  visuals: {
    key: "visuals",
    label: "ビジュアル",
    titleField: "title",
    listColumns: ["title", "member", "release_date"],
    fields: [
      { name: "slug", label: "スラッグ（URL・任意）", type: "text" },
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "image", label: "画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "release_date", label: "公開日", type: "date" },
      { name: "member", label: "メンバー", type: "text", placeholder: "全体 / 莉犬 等" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },

  media: {
    key: "media",
    label: "メディア",
    titleField: "program_name",
    listColumns: ["program_name", "station", "date_label"],
    fields: [
      { name: "type", label: "種別", type: "select", options: ["tv", "radio"], required: true },
      { name: "program_name", label: "番組名", type: "text", required: true },
      { name: "station", label: "放送局", type: "text", required: true },
      { name: "date_label", label: "放送日ラベル", type: "text", placeholder: "2026年6月4日" },
      { name: "content", label: "出演内容", type: "textarea" },
      { name: "url", label: "URL", type: "text" },
      { name: "sort_order", label: "並び順", type: "number" },
    ],
  },
}

export const TABLE_KEYS = Object.keys(TABLES)

export function getTableConfig(key: string): TableConfig | undefined {
  return TABLES[key]
}
