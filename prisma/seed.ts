/// <reference types="@prisma/client" />
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const storeNames = [
  '珈琲屋さくら', 'カフェ青空', '喫茶店はじまり', 'コーヒーハウス和', '豆香房',
  'カフェテリア緑', '珈琲専門店匠', '喫茶むすび', 'コーヒーラボ', 'カフェノワール'
]

const baristaNames = [
  '佐藤健太', '鈴木美咲', '高橋龍太郎', '田中さくら', '渡辺隆',
  '伊藤花子', '山本大輔', '中村葵', '小林太一', '加藤由美'
]

async function main() {
  for (let i = 0; i < 10; i++) {
    const baristaId = uuidv4()
    const store = await prisma.store.create({
      data: {
        name: storeNames[i],
        address: `東京都中央区銀座${i + 1}-${i + 1}-${i + 1}`,
      },
    })

    await prisma.barista.create({
      data: {
        id: baristaId,
        storeId: store.id,
        profile: {
          create: {
            name: baristaNames[i],
            yearsExperience: Math.floor(Math.random() * 15) + 1,
            bio: `${baristaNames[i]}です。コーヒーへの情熱を持って${Math.floor(Math.random() * 15) + 1}年間バリスタとして活動しています。${storeNames[i]}でお客様に最高の一杯をお届けします。`,
          },
        },
      },
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
