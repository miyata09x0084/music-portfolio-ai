'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

interface ProposalCardProps {
  proposal: {
    uuid: string;
    cover_message: string;
    quote_total_jpy: number;
    delivery_days: number;
    status: string;
    created_at: string;
    musician: {
      id: number;
      uuid: string;
      name: string;
      bio?: string;
    };
  };
  onStatusChange: () => void;
}

const statusLabels: Record<string, string> = {
  submitted: '提出済み',
  shortlisted: 'ショートリスト',
  accepted: '承認済み',
  rejected: '却下',
  withdrawn: '取り下げ済み',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

export default function ProposalCard({ proposal, onStatusChange }: ProposalCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`この提案を${statusLabels[newStatus]}にしますか？`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient(`/api/v1/proposals/${proposal.uuid}`, {
        method: 'PATCH',
        body: JSON.stringify({
          proposal: { status: newStatus }
        }),
      });

      if (res.ok) {
        onStatusChange();
      } else {
        const data = await res.json();
        setError(data.errors?.join(', ') || 'ステータスの更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{proposal.musician.name}</h3>
          {proposal.musician.bio && (
            <p className="text-sm text-gray-600 mt-1">{proposal.musician.bio}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[proposal.status] || 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabels[proposal.status] || proposal.status}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">カバーメッセージ:</p>
        <p className="text-gray-600 whitespace-pre-wrap">
          {proposal.cover_message || 'メッセージなし'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">見積金額:</span>
          <p className="font-semibold text-green-600">
            ¥{proposal.quote_total_jpy.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-gray-600">納期:</span>
          <p className="font-semibold">{proposal.delivery_days}日</p>
        </div>
        <div>
          <span className="text-gray-600">提出日:</span>
          <p className="font-semibold">
            {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
      </div>

      {proposal.status === 'submitted' && (
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => handleStatusChange('accepted')}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            承認
          </button>
          <button
            onClick={() => handleStatusChange('shortlisted')}
            disabled={loading}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            ショートリスト
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            却下
          </button>
        </div>
      )}

      {proposal.status === 'shortlisted' && (
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => handleStatusChange('accepted')}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            承認
          </button>
          <button
            onClick={() => handleStatusChange('rejected')}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            却下
          </button>
        </div>
      )}
    </div>
  );
}
