'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

interface Proposal {
  uuid: string;
  cover_message: string;
  quote_total_jpy: number;
  delivery_days: number;
  status: string;
  created_at: string;
  job: {
    uuid: string;
    title: string;
    status: string;
    client: {
      id: number;
      name: string;
    };
  };
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

export default function MyProposalsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchProposals();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchProposals = async () => {
    try {
      const res = await apiClient('/api/v1/proposals/my');
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
      } else {
        setError('提案の取得に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">マイ提案</h1>
        <p className="text-gray-600 mt-2">あなたが送った提案の一覧です</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">まだ提案がありません</p>
          <Link href="/jobs" className="text-blue-600 hover:underline">
            案件一覧を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.uuid}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    href={`/jobs/${proposal.job.uuid}`}
                    className="text-xl font-semibold text-blue-600 hover:underline"
                  >
                    {proposal.job.title}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">
                    クライアント: {proposal.job.client.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[proposal.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[proposal.status] || proposal.status}
                </span>
              </div>

              {proposal.cover_message && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">カバーメッセージ:</p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {proposal.cover_message}
                  </p>
                </div>
              )}

              <div className="flex gap-6 text-sm text-gray-600">
                <div>
                  <span className="font-medium">見積金額:</span>{' '}
                  <span className="text-green-600 font-semibold">
                    ¥{proposal.quote_total_jpy.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium">納期:</span> {proposal.delivery_days}日
                </div>
                <div>
                  <span className="font-medium">提出日:</span>{' '}
                  {new Date(proposal.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>

              {proposal.status === 'accepted' && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/messages?job_id=${proposal.job.uuid}`}
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    メッセージを送る
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
