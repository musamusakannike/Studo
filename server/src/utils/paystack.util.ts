import axios from 'axios';
import logger from './logger.util';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackAxios = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const createPaystackCustomer = async (
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
): Promise<any> => {
  try {
    const response = await paystackAxios.post('/customer', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    });

    return response.data.data;
  } catch (error: any) {
    logger.error('Error creating Paystack customer:', error.response?.data || error.message);
    throw new Error('Failed to create Paystack customer');
  }
};

export const createDedicatedVirtualAccount = async (
  customerCode: string,
  preferredBank: string = 'wema-bank'
): Promise<any> => {
  try {
    const response = await paystackAxios.post('/dedicated_account', {
      customer: customerCode,
      preferred_bank: preferredBank,
    });

    return response.data.data;
  } catch (error: any) {
    logger.error('Error creating dedicated virtual account:', error.response?.data || error.message);
    throw new Error('Failed to create dedicated virtual account');
  }
};

export const assignDedicatedVirtualAccount = async (
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  preferredBank: string = 'wema-bank'
): Promise<any> => {
  try {
    const response = await paystackAxios.post('/dedicated_account/assign', {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      preferred_bank: preferredBank,
      country: 'NG',
    });

    return response.data.data;
  } catch (error: any) {
    logger.error('Error assigning dedicated virtual account:', error.response?.data || error.message);
    throw new Error('Failed to assign dedicated virtual account');
  }
};

export const verifyTransaction = async (reference: string): Promise<any> => {
  try {
    const response = await paystackAxios.get(`/transaction/verify/${reference}`);
    return response.data.data;
  } catch (error: any) {
    logger.error('Error verifying transaction:', error.response?.data || error.message);
    throw new Error('Failed to verify transaction');
  }
};

export const fetchCustomer = async (emailOrCode: string): Promise<any> => {
  try {
    const response = await paystackAxios.get(`/customer/${emailOrCode}`);
    return response.data.data;
  } catch (error: any) {
    logger.error('Error fetching customer:', error.response?.data || error.message);
    throw new Error('Failed to fetch customer');
  }
};

export const listBanks = async (): Promise<any[]> => {
  try {
    const response = await paystackAxios.get('/bank');
    return response.data.data;
  } catch (error: any) {
    logger.error('Error listing banks:', error.response?.data || error.message);
    throw new Error('Failed to list banks');
  }
};

export const resolveAccountNumber = async (
  accountNumber: string,
  bankCode: string
): Promise<any> => {
  try {
    const response = await paystackAxios.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    return response.data.data;
  } catch (error: any) {
    logger.error('Error resolving account number:', error.response?.data || error.message);
    throw new Error('Failed to resolve account number');
  }
};
