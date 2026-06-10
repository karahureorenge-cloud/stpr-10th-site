// 管理画面のスキーマ定義（microCMS スキーマ準拠・0003_full_schema.sql と対応）。
// ここのフィールド定義が一覧・フォーム・保存処理（型変換）すべての源になる。
// DB 列は snake_case。

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "select"
  | "multiselect" // 複数選択（チェック式 select）→ text[]
  | "boolean"
  | "csv" // カンマ区切り → text[]
  | "json" // 生 JSON → jsonb
  | "number"
  | "image" // Storage 画像（ファイル選択 → 公開URL）。保存値は text(URL)
  | "imagelist" // 複数画像（ファイル選択を行追加）。保存値は text[]
  | "repeater" // 行の追加/削除ができる専用UI → jsonb 配列
  | "richtext" // Tiptap リッチテキスト。保存値は HTML 文字列（text）

/** repeater の行内サブ項目（テキストエリア廃止のため専用UIで使う） */
export type SubFieldType =
  | "text"
  | "textarea"
  | "number"
  | "image"
  | "select"
  | "repeater"
  | "richtext" // Tiptap リッチテキスト（行内）。保存値は HTML 文字列

export type SubField = {
  name: string
  label: string
  type: SubFieldType
  options?: string[] // select 用（静的）
  /** type:"select" で選択肢を動的に供給する。同一フォームの repeater から読む。
   *  "venues" は「会場公演」の会場名、"ticketLineup" は「チケットラインナップ」の
   *  チケット名、"shows" は「会場公演」の各公演（会場 日付 部）を選択肢にする。 */
  optionsSource?: "venues" | "ticketLineup" | "shows"
  placeholder?: string
  itemFields?: SubField[] // ネスト repeater 用
  /** type:"image" で複数枚アップロードを許可（行内 jsonb に URL 配列で保存）。 */
  multiple?: boolean
  /** type:"repeater" で、同一フォームの別 repeater（hidden input 名）の現在の行を
   *  コピーするボタンを表示する。例: "setlist"（基本セトリ）→ 公演ごとのセトリへ。 */
  copyFrom?: string
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
    listColumns: ["title", "group_slugs", "live_type", "status"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true, placeholder: "anniv-tour-2026" },
      {
        name: "group_slugs",
        label: "グループ（複数選択可）",
        type: "multiselect",
        options: [
          "Strawberry_Prince",
          "knightX",
          "amptak",
          "Meteorites",
          "SneakerStep",
          "True_Lip",
          "stpr_family",
        ],
        optionLabels: {
          Strawberry_Prince: "すとぷり",
          knightX: "騎士X",
          amptak: "AMPTAK×COLORS",
          Meteorites: "Meteorites",
          SneakerStep: "すにすて",
          True_Lip: "とぅるりぷ",
          stpr_family: "STPR Family（合同）",
        },
        help: "公開 /live のグループタブ絞り込みに使います（複数所属可）。",
      },
      {
        name: "group_slug",
        label: "グループ（旧・単一／後方互換）",
        type: "select",
        options: ["", "Strawberry_Prince", "knightX", "amptak", "Meteorites", "SneakerStep", "True_Lip"],
        optionLabels: {
          "": "（未設定）",
          Strawberry_Prince: "すとぷり",
          knightX: "騎士X",
          amptak: "AMPTAK×COLORS",
          Meteorites: "Meteorites",
          SneakerStep: "すにすて",
          True_Lip: "とぅるりぷ",
        },
        help: "旧フィールド。通常は上の複数選択を使ってください。",
      },
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "subtitle", label: "サブタイトル", type: "text" },
      { name: "tour_name", label: "ツアー名", type: "text" },
      {
        name: "live_type",
        label: "ライブ種別（複数選択可）",
        type: "multiselect",
        options: ["ワンマン", "ツアー", "フェス", "対バン", "配信ライブ", "オンライン", "リリイベ", "イベント出演", "その他"],
      },
      // ステータスは period_start / period_end から自動計算（フォーム非表示・保存時に自動上書き）。
      { name: "status", label: "ステータス", type: "select", options: ["coming", "ongoing", "finished"] },
      { name: "is_active", label: "公開する", type: "boolean", help: "オフにすると公開 /live 一覧から除外されます。" },
      { name: "is_family", label: "STPR Family / 合同ライブ", type: "boolean" },
      { name: "period_start", label: "開始日時", type: "text", placeholder: "2026-06-04 もしくは 2026-06-04T18:00", help: "ISO形式（datetime）" },
      { name: "period_end", label: "終了日時", type: "text", placeholder: "2026-06-06" },
      { name: "key_visual_url", label: "キービジュアル画像（新・取込用）", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します（microCMS 取込の受け皿）。" },
      { name: "key_visual", label: "キービジュアル画像（旧・後方互換）", type: "image", help: "旧フィールド。通常は上を使ってください。" },
      { name: "members", label: "出演メンバーID（旧・カンマ区切り）", type: "csv", placeholder: "rinu, root" },
      { name: "member_slugs", label: "メンバー slugs（新・取込用／カンマ区切り）", type: "csv", placeholder: "rinu, root" },
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
            label: "会場ごとのグッズ販売方法",
            type: "repeater",
            itemFields: [
              {
                name: "saleType",
                label: "販売方式",
                type: "select",
                options: ["事前整理券あり", "整理券なし（当日）", "その他"],
              },
              { name: "seirikenPeriod", label: "整理券 申込期間", type: "text", placeholder: "整理券ありのとき" },
              { name: "lotteryResultDate", label: "当選発表日", type: "text", placeholder: "整理券ありのとき" },
              { name: "lotteryUrl", label: "抽選URL", type: "text", placeholder: "整理券ありのとき" },
              { name: "saleLocation", label: "販売場所", type: "textarea" },
              { name: "saleTime", label: "販売時間", type: "textarea" },
              { name: "note", label: "補足", type: "textarea" },
            ],
          },
          { name: "venueLimitedGoods", label: "この会場限定グッズ", type: "richtext" },
          { name: "venueLimitedItems", label: "この会場限定配布物", type: "richtext" },
          { name: "setlistNotes", label: "セトリ変更メモ", type: "textarea" },
        ],
      },
      {
        name: "venues_json",
        label: "会場情報 JSON（新・取込用）",
        type: "json",
        help: '[{venueName, stageName, prefecture, shows:[{date, partLabel}]}] 形式。microCMS 取込の受け皿。',
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
          {
            name: "ticketLineupRefs",
            label: "対象チケット（ラインナップ・複数可）",
            type: "select",
            optionsSource: "ticketLineup",
            multiple: true,
          },
          {
            name: "showRefs",
            label: "対象公演（複数可）",
            type: "select",
            optionsSource: "shows",
            multiple: true,
          },
          { name: "salePeriod", label: "販売期間", type: "text" },
          // ステータスは受付開始/終了から自動計算するため status 入力は廃止。
          { name: "saleStart", label: "受付開始日時", type: "text", placeholder: "2026-05-01 10:00" },
          { name: "saleEnd", label: "受付終了日時", type: "text", placeholder: "2026-05-10 23:59" },
          { name: "price", label: "価格", type: "text" },
          { name: "method", label: "販売方式", type: "text", placeholder: "抽選 / 先着" },
          {
            name: "salesOutlets",
            label: "チケット販売場所・購入URL",
            type: "repeater",
            itemFields: [
              { name: "name", label: "販売場所", type: "text", placeholder: "STPRチケット / チケットぴあ 等" },
              { name: "url", label: "購入URL", type: "text" },
            ],
          },
          {
            name: "venueDates",
            label: "会場・日付ごとの受付期間",
            type: "repeater",
            itemFields: [
              { name: "venueName", label: "会場名", type: "select", optionsSource: "venues" },
              {
                name: "ticketLineupRefs",
                label: "対象チケット（ラインナップ・複数可）",
                type: "select",
                optionsSource: "ticketLineup",
                multiple: true,
              },
              {
                name: "showRefs",
                label: "対象公演（複数可）",
                type: "select",
                optionsSource: "shows",
                multiple: true,
              },
              { name: "date", label: "対象日付", type: "text", placeholder: "2026-06-04" },
              { name: "salePeriod", label: "受付期間", type: "text", placeholder: "2026/05/01 10:00〜2026/05/10 23:59" },
            ],
          },
        ],
      },
      {
        name: "goods_info",
        label: "グッズ受付方法",
        type: "repeater",
        help: "事前通販／会場受取／事後通販ごとに、受付期間・申込URL等を登録します。",
        itemFields: [
          {
            name: "method",
            label: "受付方法",
            type: "select",
            options: ["事前通販", "会場受取", "事後通販"],
          },
          { name: "salePeriod", label: "受付期間", type: "text", placeholder: "2025/12/01〜12/20" },
          { name: "purchaseUrl", label: "申込・購入URL", type: "text" },
          { name: "deliveryInfo", label: "配送・受取情報", type: "textarea" },
          { name: "purchaseBonus", label: "購入特典", type: "text" },
        ],
      },
      {
        name: "common_venue_limited_goods",
        label: "ツアー共通の会場限定グッズ",
        type: "richtext",
        help: "全会場共通の会場限定グッズがあればここに（自由文章＋画像）。",
      },
      {
        name: "common_venue_limited_items",
        label: "ツアー共通の会場限定配布物",
        type: "richtext",
        help: "全会場共通の会場限定配布物があればここに（自由文章＋画像）。",
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
      { name: "goods_images", label: "ツアー全体のグッズ写真（複数）", type: "image", multiple: true },
      {
        name: "setlist",
        label: "セットリスト（基本）",
        type: "repeater",
        itemFields: [
          { name: "trackNumber", label: "曲番号", type: "number" },
          { name: "title", label: "曲名", type: "text" },
          { name: "memo", label: "備考", type: "text" },
        ],
      },
      {
        name: "show_setlists",
        label: "公演ごとのセットリスト",
        type: "repeater",
        help: "公演ごとにセトリが変わる場合に使用。①ちょっとした変更や時間押しのカットは「変更点メモ」だけでOK（基本セトリ＋メモを表示）。②大きく変わる場合は「基本セトリをコピー」して曲を直してください。",
        itemFields: [
          { name: "showRef", label: "対象公演", type: "select", optionsSource: "shows" },
          {
            name: "note",
            label: "変更点メモ（これだけでもOK）",
            type: "textarea",
            placeholder: "例: 時間押しでM10カット / アンコールで〇〇を追加 / M5を△△に変更",
          },
          {
            name: "setlist",
            label: "セットリスト（大きく変わる場合のみ・基本をコピーして編集）",
            type: "repeater",
            copyFrom: "setlist",
            itemFields: [
              { name: "trackNumber", label: "曲番号", type: "number" },
              { name: "title", label: "曲名", type: "text" },
              { name: "memo", label: "備考", type: "text" },
            ],
          },
        ],
      },
      { name: "official_site_url", label: "公式サイトURL", type: "text" },
      { name: "official_playlist_url", label: "公式プレイリストURL", type: "text" },
      { name: "official_report_url", label: "公式レポートURL", type: "text" },
      { name: "unofficial_report_url", label: "非公式レポートURL", type: "text" },
      { name: "related_lives", label: "関連ライブ（旧・カンマ区切り）", type: "csv" },
      { name: "related_live_slugs", label: "関連ライブ slugs（新・取込用／カンマ区切り）", type: "csv" },
      { name: "related_albums", label: "関連アルバム（旧・カンマ区切り）", type: "csv" },
      { name: "related_album_slugs", label: "関連アルバム slugs（新・取込用／カンマ区切り）", type: "csv" },
      { name: "related_events", label: "関連イベント（スラッグ・カンマ区切り）", type: "csv" },
      { name: "has_report", label: "レポートあり", type: "boolean" },
      { name: "report_published_at", label: "レポート公開日時", type: "text", placeholder: "2026-06-10" },
      { name: "report_lead_title", label: "レポート見出し", type: "text" },
      { name: "report_content", label: "レポート本文", type: "textarea" },
      { name: "report_thumbnail", label: "レポートサムネイル画像", type: "image" },
      { name: "report_gallery", label: "レポートギャラリー 画像URL（改行/カンマ区切り）", type: "textarea" },
      { name: "is_10th", label: "10周年関連", type: "boolean" },
      { name: "sort_order", label: "並び順", type: "number" },
      { name: "microcms_id", label: "microCMS ID（移行用・通常は空欄）", type: "text" },
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
          { name: "content", label: "内容", type: "richtext" },
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
          { name: "youtubeUrl", label: "YouTube URL", type: "text" },
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

  projects: {
    key: "projects",
    label: "企画（PROJECT）",
    titleField: "title",
    listColumns: ["title", "category", "publish_date"],
    fields: [
      { name: "slug", label: "スラッグ（URL）", type: "text", required: true, placeholder: "10th-project" },
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "category", label: "カテゴリ", type: "text", placeholder: "企画 / キャンペーン 等" },
      { name: "publish_date", label: "公開日", type: "date" },
      { name: "period_start", label: "期間（開始）", type: "date" },
      { name: "period_end", label: "期間（終了）", type: "date" },
      { name: "thumbnail", label: "サムネイル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "images", label: "画像ギャラリー（複数）", type: "image", multiple: true },
      { name: "url", label: "外部URL", type: "text" },
      {
        name: "description",
        label: "説明（リッチテキスト）",
        type: "richtext",
        help: "見出し・装飾・リスト・リンク・画像が使えます。HTML として保存されます。",
      },
    ],
  },

  movies: {
    key: "movies",
    label: "動画（MOVIE）",
    titleField: "title",
    listColumns: ["title", "category", "publish_date"],
    fields: [
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "category", label: "カテゴリ", type: "text", placeholder: "MV / ダイジェスト 等" },
      { name: "publish_date", label: "公開日", type: "date" },
      { name: "thumbnail", label: "サムネイル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "url", label: "外部URL（YouTube 等）", type: "text" },
      { name: "description", label: "説明", type: "textarea" },
    ],
  },

  streams: {
    key: "streams",
    label: "配信（STREAM）",
    titleField: "title",
    listColumns: ["title", "category", "publish_date"],
    fields: [
      { name: "title", label: "タイトル", type: "text", required: true },
      { name: "category", label: "カテゴリ", type: "text", placeholder: "生配信 / アーカイブ 等" },
      { name: "publish_date", label: "配信日", type: "date" },
      { name: "thumbnail", label: "サムネイル画像", type: "image", help: "画像ファイルを選択するとアップロードして公開URLを自動入力します。" },
      { name: "url", label: "外部URL（配信ページ）", type: "text" },
      { name: "description", label: "説明", type: "textarea" },
    ],
  },
}

export const TABLE_KEYS = Object.keys(TABLES)

export function getTableConfig(key: string): TableConfig | undefined {
  return TABLES[key]
}
