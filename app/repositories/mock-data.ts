// モック用バリスタデータ
export const mockBaristaProfiles = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    user_id: "11111111-1111-1111-1111-111111111111",
    type: "barista",
    display_name: "山田コーヒー",
    icon_url: "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "5年間のバリスタ経験があります。スペシャルティコーヒーが得意で、特にエチオピア産のコーヒー豆を使ったハンドドリップが好評です。",
    sns_links: {
      instagram: "yamada_coffee",
      twitter: "yamada_barista",
    },
    shop_name: "コーヒーハウス山田",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15日前
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    user_id: "22222222-2222-2222-2222-222222222222",
    type: "barista",
    display_name: "佐藤エスプレッソ",
    icon_url: "https://randomuser.me/api/portraits/women/2.jpg",
    bio: "イタリアで修行したエスプレッソの専門家です。ラテアートにも力を入れており、カプチーノやラテの見た目も美しさにこだわっています。",
    sns_links: {
      instagram: "sato_espresso",
      twitter: "sato_latte",
    },
    shop_name: "カフェ サトウ",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10日前
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    user_id: "33333333-3333-3333-3333-333333333333",
    type: "barista",
    display_name: "田中ブリュー",
    icon_url: "https://randomuser.me/api/portraits/men/3.jpg",
    bio: "自家焙煎のスペシャリストです。コーヒー豆の選定から焙煎、抽出までのすべての工程にこだわりを持っています。季節に合わせたブレンドも好評です。",
    sns_links: {
      instagram: "tanaka_brew",
      twitter: "tanaka_coffee",
    },
    shop_name: "ロースターズ タナカ",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5日前
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
