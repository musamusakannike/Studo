import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Plus, Info } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useTheme } from '../../src/contexts/ThemeContext';
import { walletService } from '../../src/services/wallet.service';
import { Transaction } from '../../src/types';
import { QUERY_KEYS } from '../../src/constants/config';
import { spacing, borderRadius, fontSize, fontWeight, iconSize } from '../../src/constants/spacing';
import BottomSheet from '@gorhom/bottom-sheet';

export default function WalletScreen() {
  const { colors } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  const { data: walletData, isLoading: loadingWallet } = useQuery({
    queryKey: [QUERY_KEYS.WALLET],
    queryFn: () => walletService.getWallet(),
  });

  const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS],
    queryFn: () => walletService.getTransactionHistory(),
  });

  const wallet = walletData?.data;
  const transactions = transactionsData?.data?.docs || [];

  const handleShowDVA = () => {
    bottomSheetRef.current?.expand();
  };

  const renderTransactionItem = ({ item: transaction }: { item: Transaction }) => {
    const isCredit = transaction.type === 'credit';
    
    return (
      <Card style={styles.transactionCard} padding="md">
        <View style={styles.transactionContent}>
          <View
            style={[
              styles.transactionIcon,
              { backgroundColor: isCredit ? colors.successMuted : colors.errorMuted },
            ]}
          >
            {isCredit ? (
              <ArrowDownLeft size={iconSize.sm} color={colors.success} />
            ) : (
              <ArrowUpRight size={iconSize.sm} color={colors.error} />
            )}
          </View>
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionDescription, { color: colors.text }]}>
              {transaction.description}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
              {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              { color: isCredit ? colors.success : colors.error },
            ]}
          >
            {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
          </Text>
        </View>
      </Card>
    );
  };

  if (loadingWallet) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.balanceCard}
        >
          <Card
            style={{ ...styles.balanceCardInner, backgroundColor: colors.primary }}
            padding="xl"
          >
            <View style={styles.balanceHeader}>
              <Text style={[styles.balanceLabel, { color: colors.textInverse }]}>
                Total Balance
              </Text>
              <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
                {balanceVisible ? (
                  <Eye size={iconSize.sm} color={colors.textInverse} />
                ) : (
                  <EyeOff size={iconSize.sm} color={colors.textInverse} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.balanceAmount, { color: colors.textInverse }]}>
              {balanceVisible ? `₦${wallet?.balance.toLocaleString() || '0'}` : '₦****'}
            </Text>
            <View style={styles.balanceActions}>
              <Button
                title="Fund Wallet"
                onPress={handleShowDVA}
                variant="secondary"
                size="sm"
                icon={<Plus size={iconSize.xs} color={colors.textInverse} />}
              />
              <Button
                title="Withdraw"
                onPress={() => {}}
                variant="outline"
                size="sm"
                style={{ ...styles.withdrawButton, borderColor: colors.textInverse }}
                textStyle={{ color: colors.textInverse }}
              />
            </View>
          </Card>
        </MotiView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {loadingTransactions ? (
            <LoadingSpinner />
          ) : transactions.length === 0 ? (
            <Card style={styles.emptyState} padding="xl">
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No transactions yet
              </Text>
            </Card>
          ) : (
            <View>
              {transactions.map((transaction) => (
                <View key={transaction._id}>
                  {renderTransactionItem({ item: transaction })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['50%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
            Dedicated Virtual Account
          </Text>
          <Text style={[styles.bottomSheetSubtitle, { color: colors.textSecondary }]}>
            Fund your wallet by transferring to this account
          </Text>

          {wallet?.accountNumber ? (
            <Card style={styles.dvaCard} padding="lg">
              <View style={styles.dvaRow}>
                <Text style={[styles.dvaLabel, { color: colors.textSecondary }]}>
                  Bank Name
                </Text>
                <Text style={[styles.dvaValue, { color: colors.text }]}>
                  {wallet.bankName}
                </Text>
              </View>
              <View style={styles.dvaRow}>
                <Text style={[styles.dvaLabel, { color: colors.textSecondary }]}>
                  Account Number
                </Text>
                <Text style={[styles.dvaValue, { color: colors.text }]}>
                  {wallet.accountNumber}
                </Text>
              </View>
              <View style={styles.dvaRow}>
                <Text style={[styles.dvaLabel, { color: colors.textSecondary }]}>
                  Account Name
                </Text>
                <Text style={[styles.dvaValue, { color: colors.text }]}>
                  {wallet.accountName}
                </Text>
              </View>
            </Card>
          ) : (
            <Card style={styles.noDvaCard} padding="lg">
              <Info size={iconSize.lg} color={colors.info} />
              <Text style={[styles.noDvaText, { color: colors.textSecondary }]}>
                Your dedicated account is being set up. Please check back shortly.
              </Text>
            </Card>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
  },
  balanceCard: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  balanceCardInner: {
    borderWidth: 0,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  withdrawButton: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  transactionCard: {
    marginBottom: spacing.sm,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  transactionDate: {
    fontSize: fontSize.xs,
  },
  transactionAmount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
  },
  bottomSheetContent: {
    padding: spacing.xl,
  },
  bottomSheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  bottomSheetSubtitle: {
    fontSize: fontSize.sm,
    marginBottom: spacing.lg,
  },
  dvaCard: {
    gap: spacing.md,
  },
  dvaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dvaLabel: {
    fontSize: fontSize.sm,
  },
  dvaValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  noDvaCard: {
    alignItems: 'center',
    gap: spacing.md,
  },
  noDvaText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
