import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router'; // Will be used when add transaction route is set up
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ButtonSeventy from '@/components/button/buttonSeventy';

interface Transaction {
  id: string;
  merchant: string;
  date: string;
  category: string;
  amount: number;
  earned: number;
}

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

export default function TransactionsPage() {
  const router = useRouter();

  // TODO: Replace with backend API call
  // const fetchTransactions = async () => {
  //   const response = await fetch('/api/transactions/');
  //   const data = await response.json();
  //   return data;
  // };

  // Placeholder data - will be replaced with backend data
  // Set to empty array to show empty state, or populate with data to show transactions
  const transactionGroups: TransactionGroup[] = [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transactions</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => {
              router.push('/(tabs)/addTransactions');
            }}
          >
            <Ionicons name="add" size={24} color="#000000" />
          </Pressable>
        </View>

        {/* Transactions List or Empty State */}
        {transactionGroups.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text style={styles.emptyStateTitle}>
                You don&apos;t have a transactions yet.{'\n'}Add one now!
              </Text>
              <ButtonSeventy
                text="Add Transactions"
                onPress={() => router.push('/(tabs)/addTransactions')}
              />
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {transactionGroups.map((group, groupIndex) => (
              <View key={group.date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>{group.date}</Text>
                <View style={styles.transactionsList}>
                  {group.transactions.map((transaction, index) => (
                    <Pressable
                      key={transaction.id}
                      style={styles.transactionCard}
                      onPress={() => {
                        router.push({
                          pathname: '/(tabs)/transactionsDetail',
                          params: { transactionId: transaction.id },
                        });
                      }}
                    >
                      <View style={styles.transactionLeft}>
                        <Text style={styles.merchantName}>{transaction.merchant}</Text>
                        <Text style={styles.transactionDetails}>
                          {transaction.date} • {transaction.category}
                        </Text>
                      </View>
                      <View style={styles.transactionRight}>
                        <Text style={styles.transactionAmount}>
                          ${transaction.amount.toFixed(2)}
                        </Text>
                        <Text style={styles.earnedText}>
                          ${transaction.earned.toFixed(2)} Earned
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
                {groupIndex < transactionGroups.length - 1 && (
                  <View style={styles.groupSpacing} />
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 20,
    paddingBottom: 80, // Space for nav bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginLeft: 30,
    flex: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 9,
  },
  transactionsList: {
    gap: 9,
  },
  transactionCard: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E6EAEF',
    borderRadius: 20,
    padding: 19,
    height: 59,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 2,
  },
  transactionDetails: {
    fontSize: 8,
    fontWeight: '600',
    color: '#777777',
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 2,
  },
  earnedText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#777777',
  },
  groupSpacing: {
    height: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 16,
    width: 350,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    lineHeight: 28,
  },
  addButtonEmpty: {
    backgroundColor: '#5E17EB',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '70%',
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

