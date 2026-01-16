class Api::V1::ProposalsController < ApplicationController
  before_action :set_job, only: [:index, :create]
  before_action :set_proposal, only: [:show, :update, :withdraw]

  # GET /api/v1/jobs/:job_uuid/proposals
  # クライアント用: 自分の案件への提案一覧
  def index
    unless @job.client_id == current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end

    proposals = @job.proposals.includes(:musician).order(created_at: :desc)

    render json: {
      proposals: proposals.map { |p| proposal_json(p) }
    }
  end

  # GET /api/v1/proposals/:uuid
  # 提案詳細（提案者またはクライアントのみ閲覧可能）
  def show
    unless can_access_proposal?(@proposal)
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end

    render json: { proposal: proposal_json(@proposal, detailed: true) }
  end

  # POST /api/v1/jobs/:job_uuid/proposals
  # ミュージシャン用: 提案作成
  def create
    proposal = @job.proposals.build(proposal_params.merge(musician: current_user))

    if proposal.save
      render json: { proposal: proposal_json(proposal) }, status: :created
    else
      render json: { errors: proposal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/proposals/:uuid
  # クライアント用: ステータス更新（承認/却下）
  def update
    unless @proposal.job.client_id == current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end

    if @proposal.update(status_params)
      render json: { proposal: proposal_json(@proposal) }
    else
      render json: { errors: @proposal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/proposals/:uuid/withdraw
  # ミュージシャン用: 提案取り下げ
  def withdraw
    unless @proposal.musician_id == current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end

    if @proposal.update(status: 'withdrawn')
      render json: { message: '提案を取り下げました' }
    else
      render json: { errors: @proposal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/proposals/my
  # ミュージシャン用: 自分の提案一覧
  def my
    proposals = current_user.proposals.includes(job: :client).order(created_at: :desc)

    render json: {
      proposals: proposals.map { |p| proposal_json(p, include_job: true) }
    }
  end

  private

  def set_job
    @job = Job.find_by(uuid: params[:job_uuid])
    unless @job
      render json: { error: '案件が見つかりません' }, status: :not_found
    end
  end

  def set_proposal
    @proposal = Proposal.includes(:musician, job: :client).find_by(uuid: params[:uuid])
    unless @proposal
      render json: { error: '提案が見つかりません' }, status: :not_found
    end
  end

  def proposal_params
    params.require(:proposal).permit(:cover_message, :quote_total_jpy, :delivery_days)
  end

  def status_params
    params.require(:proposal).permit(:status)
  end

  def can_access_proposal?(proposal)
    proposal.musician_id == current_user.id || proposal.job.client_id == current_user.id
  end

  def proposal_json(proposal, detailed: false, include_job: false)
    data = {
      uuid: proposal.uuid,
      cover_message: proposal.cover_message,
      quote_total_jpy: proposal.quote_total_jpy,
      delivery_days: proposal.delivery_days,
      status: proposal.status,
      created_at: proposal.created_at,
      musician: {
        id: proposal.musician.id,
        uuid: proposal.musician.uuid,
        name: proposal.musician.name,
        bio: proposal.musician.bio
      }
    }

    if include_job && proposal.job
      data[:job] = {
        uuid: proposal.job.uuid,
        title: proposal.job.title,
        status: proposal.job.status,
        client: {
          id: proposal.job.client.id,
          name: proposal.job.client.name
        }
      }
    end

    data
  end
end
