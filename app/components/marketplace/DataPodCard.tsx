'use client';

import Link from 'next/link';
import { DataPod } from '@/app/types';
import { formatPrice, formatFileSize, formatRating } from '@/app/utils/format.utils';
import { Star, Download } from 'lucide-react';
import { Badge } from '@/app/components/common/Badge';

interface DataPodCardProps {
  dataPod: DataPod;
}

export const DataPodCard: React.FC<DataPodCardProps> = ({ dataPod: rawDataPod }) => {
  // Handle both API response formats (snake_case from API, camelCase from store)
  const dataPod = rawDataPod as any;
  const title = dataPod.title || '';
  const category = dataPod.category || 'uncategorized';
  const status = dataPod.status || 'draft';
  const rating = (dataPod.average_rating || dataPod.averageRating || 0) as number;
  const totalSales = (dataPod.total_sales || dataPod.totalSales || 0) as number;
  const priceSui = (dataPod.price_sui || dataPod.priceSui || 0) as number;
  const sizeBytes = (dataPod.size_bytes || dataPod.fileSize || 0) as number;
  const description = dataPod.description || 'No description available';

  return (
    <Link href={`/marketplace/${dataPod.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{title}</h3>
            <Badge variant={status === 'published' ? 'success' : 'warning'}>{status}</Badge>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Category & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase">{category}</span>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({totalSales})</span>
            </div>
          </div>

          {/* File Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Download size={14} />
              {totalSales} purchases
            </span>
            <span>{formatFileSize(sizeBytes)}</span>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-lg font-bold text-gray-900">{priceSui} SUI</p>
          </div>
        </div>
      </div>
    </Link>
  );
};
