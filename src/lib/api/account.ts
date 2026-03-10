import type { HttpClient } from '../http';
import type {
  ApplyCodeParams,
  BalanceResponse,
  CloseInvestmentParams,
  CodeResponse,
  CodesHistoryParams,
  CodesHistoryResponse,
  CreateAddressParams,
  CreateCodeParams,
  CreditLinesResponse,
  CryptoDepositAddressParams,
  DepositAddressResponse,
  DepositRefundParams,
  FeeResponse,
  FiatDepositAddressParams,
  FiatDepositAddressResponse,
  FlexAutoReinvestParams,
  FlexCloseParams,
  FlexInvestment,
  FlexInvestmentHistoryParams,
  FlexInvestmentHistoryResponse,
  FlexInvestParams,
  FlexibleInvestmentPlan,
  FlexPaymentHistoryParams,
  FlexWithdrawParams,
  InterestPaymentsHistoryParams,
  InterestPaymentsHistoryResponse,
  InvestmentPlan,
  InvestmentResponse,
  InvestmentsHistoryParams,
  InvestmentsHistoryResponse,
  InvestParams,
  JwtTokenResponse,
  MainBalanceParams,
  MainBalanceResponse,
  MiningHashrateResponse,
  MyCodesParams,
  TransferParams,
  TransferResponse,
  WebsocketProfileTokenResponse,
  WithdrawCryptoParams,
  WithdrawCryptoWithAmountParams,
  WithdrawFiatParams,
  WithdrawHistoryParams,
  WithdrawHistoryResponse,
  WithdrawResponse,
} from '../types/account';

export class AccountApi {
  constructor(private readonly httpClient: HttpClient) {}

  async mainBalance(params?: MainBalanceParams): Promise<MainBalanceResponse> {
    const body: Record<string, unknown> = {};
    if (params?.ticker) {
      body.ticker = params.ticker;
    }
    const response = await this.httpClient.post<MainBalanceResponse>(
      '/api/v4/main-account/balance',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch main balance');
    }
    return response.data;
  }

  async balance(): Promise<BalanceResponse> {
    const response = await this.httpClient.post<BalanceResponse>(
      '/api/v4/trade-account/balance',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch balance');
    }
    return response.data;
  }

  async fee(): Promise<FeeResponse> {
    const response = await this.httpClient.post<FeeResponse>(
      '/api/v4/main-account/fee',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch fee');
    }
    return response.data;
  }

  async cryptoDepositAddress(params: CryptoDepositAddressParams): Promise<DepositAddressResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
    };
    if (params.network) {
      body.network = params.network;
    }
    const response = await this.httpClient.post<DepositAddressResponse>(
      '/api/v4/main-account/address',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch deposit address');
    }
    return response.data;
  }

  async fiatDepositAddress(params: FiatDepositAddressParams): Promise<FiatDepositAddressResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
      provider: params.provider,
    };
    if (params.amount) {
      body.amount = params.amount;
    }
    if (params.uniqueId) {
      body.uniqueId = params.uniqueId;
    }
    const response = await this.httpClient.post<FiatDepositAddressResponse>(
      '/api/v4/main-account/fiat-deposit-url',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch fiat deposit address');
    }
    return response.data;
  }

  async createAddress(params: CreateAddressParams): Promise<DepositAddressResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
    };
    if (params.network) {
      body.network = params.network;
    }
    const response = await this.httpClient.post<DepositAddressResponse>(
      '/api/v4/main-account/create-new-address',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create address');
    }
    return response.data;
  }

  async withdrawCrypto(params: WithdrawCryptoParams): Promise<WithdrawResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
      amount: params.amount,
      address: params.address,
    };
    if (params.network) {
      body.network = params.network;
    }
    if (params.memo) {
      body.memo = params.memo;
    }
    if (params.uniqueId) {
      body.uniqueId = params.uniqueId;
    }
    const response = await this.httpClient.post<WithdrawResponse>(
      '/api/v4/main-account/withdraw',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to withdraw crypto');
    }
    return response.data;
  }

  async withdrawCryptoWithAmount(
    params: WithdrawCryptoWithAmountParams,
  ): Promise<WithdrawResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
      amount: params.amount,
      address: params.address,
    };
    if (params.network) {
      body.network = params.network;
    }
    if (params.uniqueId) {
      body.uniqueId = params.uniqueId;
    }
    const response = await this.httpClient.post<WithdrawResponse>(
      '/api/v4/main-account/withdraw-pay',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to withdraw crypto with amount');
    }
    return response.data;
  }

  async withdrawFiat(params: WithdrawFiatParams): Promise<WithdrawResponse> {
    const response = await this.httpClient.post<WithdrawResponse>(
      '/api/v4/main-account/withdraw-fiat',
      params,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to withdraw fiat');
    }
    return response.data;
  }

  async depositRefund(params: DepositRefundParams): Promise<WithdrawResponse> {
    const response = await this.httpClient.post<WithdrawResponse>(
      '/api/v4/main-account/deposit-refund',
      { id: params.id },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to refund deposit');
    }
    return response.data;
  }

  async withdrawHistory(params?: WithdrawHistoryParams): Promise<WithdrawHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    if (params?.transactionMethod !== undefined) {
      body.transactionMethod = params.transactionMethod;
    }
    const response = await this.httpClient.post<WithdrawHistoryResponse>(
      '/api/v4/main-account/history',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch withdraw history');
    }
    return response.data;
  }

  async transfer(params: TransferParams): Promise<TransferResponse> {
    const response = await this.httpClient.post<TransferResponse>(
      '/api/v4/main-account/transfer',
      {
        ticker: params.ticker,
        amount: params.amount,
        from: params.from,
        to: params.to,
      },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to transfer');
    }
    return response.data;
  }

  async createCode(params: CreateCodeParams): Promise<CodeResponse> {
    const body: Record<string, unknown> = {
      ticker: params.ticker,
      amount: params.amount,
    };
    if (params.passphrase) {
      body.passphrase = params.passphrase;
    }
    if (params.description) {
      body.description = params.description;
    }
    const response = await this.httpClient.post<CodeResponse>('/api/v4/main-account/codes', body, {
      category: 'account',
    });
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to create code');
    }
    return response.data;
  }

  async applyCode(params: ApplyCodeParams): Promise<CodeResponse> {
    const body: Record<string, unknown> = {
      code: params.code,
    };
    if (params.passphrase) {
      body.passphrase = params.passphrase;
    }
    const response = await this.httpClient.post<CodeResponse>(
      '/api/v4/main-account/codes/apply',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to apply code');
    }
    return response.data;
  }

  async codesHistory(params?: CodesHistoryParams): Promise<CodesHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<CodesHistoryResponse>(
      '/api/v4/main-account/codes/history',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch codes history');
    }
    return response.data;
  }

  async myCodes(params?: MyCodesParams): Promise<CodesHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<CodesHistoryResponse>(
      '/api/v4/main-account/codes/my',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch my codes');
    }
    return response.data;
  }

  async plans(): Promise<InvestmentPlan[]> {
    const response = await this.httpClient.post<InvestmentPlan[]>(
      '/api/v4/main-account/smart/plans',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch plans');
    }
    return response.data;
  }

  async invest(params: InvestParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart/investment',
      {
        planId: params.planId,
        amount: params.amount,
      },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to invest');
    }
    return response.data;
  }

  async investmentsHistory(params?: InvestmentsHistoryParams): Promise<InvestmentsHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<InvestmentsHistoryResponse>(
      '/api/v4/main-account/smart/investments',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch investments history');
    }
    return response.data;
  }

  async closeInvestment(params: CloseInvestmentParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart/investment/close',
      { id: params.id },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to close investment');
    }
    return response.data;
  }

  async flexPlans(): Promise<FlexibleInvestmentPlan[]> {
    const response = await this.httpClient.post<FlexibleInvestmentPlan[]>(
      '/api/v4/main-account/smart-flex/plans',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch flexible plans');
    }
    return response.data;
  }

  async flexInvest(params: FlexInvestParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart-flex/investments/invest',
      {
        planId: params.planId,
        amount: params.amount,
      },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to flex invest');
    }
    return response.data;
  }

  async flexInvestments(): Promise<FlexInvestment[]> {
    const response = await this.httpClient.post<FlexInvestment[]>(
      '/api/v4/main-account/smart-flex/investments',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch flexible investments');
    }
    return response.data;
  }

  async flexInvestmentHistory(
    params?: FlexInvestmentHistoryParams,
  ): Promise<FlexInvestmentHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<FlexInvestmentHistoryResponse>(
      '/api/v4/main-account/smart-flex/investments/history',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch flexible investment history');
    }
    return response.data;
  }

  async flexPaymentHistory(
    params?: FlexPaymentHistoryParams,
  ): Promise<FlexInvestmentHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<FlexInvestmentHistoryResponse>(
      '/api/v4/main-account/smart-flex/investments/payment-history',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch flexible payment history');
    }
    return response.data;
  }

  async flexWithdraw(params: FlexWithdrawParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart-flex/investments/withdraw',
      {
        id: params.id,
        amount: params.amount,
      },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to withdraw from flexible investment');
    }
    return response.data;
  }

  async flexClose(params: FlexCloseParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart-flex/investments/close',
      { id: params.id },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to close flexible investment');
    }
    return response.data;
  }

  async flexAutoReinvest(params: FlexAutoReinvestParams): Promise<InvestmentResponse> {
    const response = await this.httpClient.post<InvestmentResponse>(
      '/api/v4/main-account/smart-flex/investments/auto-invest',
      {
        id: params.id,
        enabled: params.enabled,
      },
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to set auto-reinvest');
    }
    return response.data;
  }

  async miningHashrate(): Promise<MiningHashrateResponse> {
    const response = await this.httpClient.post<MiningHashrateResponse>(
      '/api/v4/mining/hashrate',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch mining hashrate');
    }
    return response.data;
  }

  async interestPaymentsHistory(
    params?: InterestPaymentsHistoryParams,
  ): Promise<InterestPaymentsHistoryResponse> {
    const body: Record<string, unknown> = {};
    if (params?.limit !== undefined) {
      body.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      body.offset = params.offset;
    }
    const response = await this.httpClient.post<InterestPaymentsHistoryResponse>(
      '/api/v4/main-account/smart/interest-payment-history',
      body,
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch interest payments history');
    }
    return response.data;
  }

  async creditLines(): Promise<CreditLinesResponse> {
    const response = await this.httpClient.post<CreditLinesResponse>(
      '/api/v4/credit-line/loans/info',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch credit lines');
    }
    return response.data;
  }

  async issueJwtToken(): Promise<JwtTokenResponse> {
    const response = await this.httpClient.post<JwtTokenResponse>(
      '/api/v4/profile/jwt/issue',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to issue JWT token');
    }
    return response.data;
  }

  async websocketProfileToken(): Promise<WebsocketProfileTokenResponse> {
    const response = await this.httpClient.post<WebsocketProfileTokenResponse>(
      '/api/v4/profile/websocket_token',
      {},
      { category: 'account' },
    );
    if (!response.success || !response.data) {
      throw new Error(response.error?.message ?? 'Failed to fetch websocket profile token');
    }
    return response.data;
  }
}
