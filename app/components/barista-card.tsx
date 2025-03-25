"use client";

import Image from "next/image";
import Link from "next/link";
import type { Profile } from "../repositories/profiles-repository";

type BaristaCardProps = {
  profile: Profile;
};

export default function BaristaCard({ profile }: BaristaCardProps) {
  return (
    <Link href={`/barista/${profile.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
        <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
          {profile.icon_url ? (
            <Image
              src={profile.icon_url}
              alt={profile.display_name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-16 h-16"
                aria-labelledby="profileAvatarTitle"
              >
                <title id="profileAvatarTitle">プロフィール画像</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">{profile.display_name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{profile.shop_name}</p>
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 text-sm">{profile.bio}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-2">
              {profile.sns_links?.instagram && (
                <span className="text-pink-500 text-sm">Instagram</span>
              )}
              {profile.sns_links?.twitter && <span className="text-blue-400 text-sm">Twitter</span>}
            </div>
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              バリスタ
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
