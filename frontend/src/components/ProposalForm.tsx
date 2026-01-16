'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface ProposalFormProps {
  jobUuid: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
}

export default function ProposalForm({ jobUuid, budgetMin, budgetMax }: ProposalFormProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    cover_message: '',
    quote_total_jpy: '',
    delivery_days: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">提案するにはログインが必要です</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          ログイン
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient(`/api/v1/jobs/${jobUuid}/proposals`, {
        method: 'POST',
        body: JSON.stringify({
          proposal: {
            cover_message: formData.cover_message,
            quote_total_jpy: parseInt(formData.quote_total_jpy),
            delivery_days: parseInt(formData.delivery_days),
          }
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.errors?.join(', ') || '提案の送信に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium mb-2">提案を送信しました!</p>
        <p className="text-sm text-green-700 mb-4">クライアントからの返信をお待ちください</p>
        <button
          onClick={() => router.push('/proposals/my')}
          className="text-green-600 underline"
        >
          マイ提案を確認
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg p-6 border">
      <h3 className="text-lg font-semibold">この案件に提案する</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">カバーメッセージ</label>
        <textarea
          value={formData.cover_message}
          onChange={(e) => setFormData({ ...formData, cover_message: e.target.value })}
          className="w-full border rounded-lg p-3 h-32"
          placeholder="あなたのスキルやこの案件への意気込みを伝えましょう"
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.cover_message.length} / 2000</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">見積金額 (円) *</label>
          <input
            type="number"
            value={formData.quote_total_jpy}
            onChange={(e) => setFormData({ ...formData, quote_total_jpy: e.target.value })}
            className="w-full border rounded-lg p-3"
            required
            min={1}
          />
          {budgetMin && budgetMax && (
            <p className="text-xs text-gray-500 mt-1">
              予算目安: ¥{budgetMin.toLocaleString()} - ¥{budgetMax.toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">納期 (日数) *</label>
          <input
            type="number"
            value={formData.delivery_days}
            onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
            className="w-full border rounded-lg p-3"
            required
            min={1}
            placeholder="例: 14"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? '送信中...' : '提案を送信'}
      </button>
    </form>
  );
}
