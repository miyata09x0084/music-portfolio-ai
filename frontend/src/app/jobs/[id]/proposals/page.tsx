'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import ProposalCard from '@/components/ProposalCard';
import Link from 'next/link';

interface Proposal {
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
}

export default function JobProposalsPage() {
  const params = useParams();
  const jobUuid = params.id as string;
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchProposals();
    }
  }, [isAuthenticated, isLoading, router, jobUuid]);

  const fetchProposals = async () => {
    try {
      const res = await apiClient(`/api/v1/jobs/${jobUuid}/proposals`);
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals);
      } else if (res.status === 403) {
        setError('この案件の提案を閲覧する権限がありません');
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
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Link href={`/jobs/${jobUuid}`} className="text-blue-600 hover:underline">
          案件詳細に戻る
        </Link>
      </div>
    );
  }

  const submittedProposals = proposals.filter(p => p.status === 'submitted');
  const shortlistedProposals = proposals.filter(p => p.status === 'shortlisted');
  const acceptedProposals = proposals.filter(p => p.status === 'accepted');
  const rejectedProposals = proposals.filter(p => p.status === 'rejected');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/jobs/${jobUuid}`} className="text-blue-600 hover:underline mb-2 inline-block">
          ← 案件詳細に戻る
        </Link>
        <h1 className="text-3xl font-bold">提案一覧</h1>
        <p className="text-gray-600 mt-2">この案件への提案: {proposals.length}件</p>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">まだ提案がありません</p>
        </div>
      ) : (
        <div className="space-y-8">
          {submittedProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                新規提案 ({submittedProposals.length})
              </h2>
              <div className="space-y-4">
                {submittedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.uuid}
                    proposal={proposal}
                    onStatusChange={fetchProposals}
                  />
                ))}
              </div>
            </div>
          )}

          {shortlistedProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                ショートリスト ({shortlistedProposals.length})
              </h2>
              <div className="space-y-4">
                {shortlistedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.uuid}
                    proposal={proposal}
                    onStatusChange={fetchProposals}
                  />
                ))}
              </div>
            </div>
          )}

          {acceptedProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                承認済み ({acceptedProposals.length})
              </h2>
              <div className="space-y-4">
                {acceptedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.uuid}
                    proposal={proposal}
                    onStatusChange={fetchProposals}
                  />
                ))}
              </div>
            </div>
          )}

          {rejectedProposals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-500">
                却下済み ({rejectedProposals.length})
              </h2>
              <div className="space-y-4 opacity-60">
                {rejectedProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.uuid}
                    proposal={proposal}
                    onStatusChange={fetchProposals}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
