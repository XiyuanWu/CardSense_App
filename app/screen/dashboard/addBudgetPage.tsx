import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TextInputFull from '../../components/textInput/textInputFull';
import ButtonHalf from '../../components/button/buttonHalf';

export default function AddBudgetPage() {
  const router = useRouter();
  const [monthYear, setMonthYear] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleCancel = () => {
    // Navigate back to budgetPage
    router.push('/(tabs)/budget');
  };

  const handleAdd = async () => {
    // TODO: Replace with backend API call
    // const addBudget = async () => {
    //   const response = await fetch('/api/budgets/', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       month_year: monthYear,
    //       amount: parseFloat(budgetAmount),
    //     }),
    //   });
    //   const data = await response.json();
    //   return data;
    // };
    
    // Placeholder: Call backend API
    // await addBudget();
    
    // Navigate back to budgetPage after adding
    router.push('/(tabs)/budget');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.push('/(tabs)/budget')}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </Pressable>
          <Text style={styles.title}>Add Budgets</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {/* Form Group */}
        <View style={styles.formGroup}>
          {/* Subtitle */}
          <Text style={styles.subtitle}>Add a budget</Text>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Month/year"
                value={monthYear}
                onChangeText={setMonthYear}
              />
            </View>
            <View style={styles.inputSpacing} />
            <View style={styles.inputWrapper}>
              <TextInputFull
                placeholder="Budget Amount"
                value={budgetAmount}
                onChangeText={setBudgetAmount}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <ButtonHalf
              button1={{
                color: '#FFFFFF',
                text: 'Cancel',
                border: '#E6EAEF',
                textColor: '#222222',
                onPress: handleCancel,
              }}
              button2={{
                color: '#5E17EB',
                text: 'Add',
                textColor: '#FFFFFF',
                onPress: handleAdd,
              }}
            />
          </View>
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    flex: 1,
  },
  formGroup: {
    marginTop: 20, // Space from header
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginLeft: 2, // Align with inputs (37px - 35px padding)
    marginBottom: 15, // Space from subtitle to first input
  },
  inputsContainer: {
    marginBottom: 20, // Space between inputs and buttons
  },
  inputWrapper: {
    marginHorizontal: -15, // Cancel out TextInputFull's marginHorizontal: 15
  },
  inputSpacing: {
    height: 10,
  },
  buttonsContainer: {
    marginTop: 15,
    marginHorizontal: -15, // Cancel out ButtonHalf's marginHorizontal: 15 to align with inputs
  },
});

