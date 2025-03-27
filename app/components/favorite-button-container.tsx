"use client";

import FavoriteButton from "./favorite-button";

type FavoriteButtonContainerProps = {
  baristaProfileId: string;
};

export default function FavoriteButtonContainer({
  baristaProfileId,
}: FavoriteButtonContainerProps) {
  return (
    <div className="w-full">
      <FavoriteButton
        baristaProfileId={baristaProfileId}
        className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-full transition-colors"
      />
    </div>
  );
}
