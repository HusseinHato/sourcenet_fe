'use client';

import Link from 'next/link';
import { DataPod } from '@/app/types';
import { formatPrice, formatFileSize, formatRating } from '@/app/utils/format.utils';
import { Star, Download } from 'lucide-react';
import { Badge } from '@/app/components/common/Badge';

interface DataPodCardProps {
  dataPod: DataPod;
}

export const DataPodCard: React.FC<DataPodCardProps> = ({ dataPod }) => {
  return (
    <Link href={`/marketplace/${dataPod.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{dataPod.title}</h3>
            <Badge variant={dataPod.status === 'published' ? 'success' : 'warning'}>{dataPod.status}</Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{dataPod.description}</p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase">{dataPod.category}</span>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{dataPod.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({dataPod.reviewCount})</span>
            </div>
          </div>

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Download size={14} />
              {dataPod.purchaseCount} purchases
            </span>
            <span>{formatFileSize(dataPod.fileSize)}</span>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-lg font-bold text-blue-600">{formatPrice(dataPod.price, dataPod.currency)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
