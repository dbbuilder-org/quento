/**
 * Welcome Screen - Quento Mobile App
 *
 * AI App Development powered by ServiceVision (https://www.servicevision.net)
 */

import { Link } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        {/* Ring visualization will go here */}
        <View style={styles.ringPlaceholder}>
          <Text style={styles.ringEmoji}>🌳</Text>
        </View>

        <Text style={styles.title}>QUENTO</Text>
        <Text style={styles.tagline}>Story First. Growth Always.</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.description}>
          Like the rings of a tree, your business grows in layers. Let's build your story together.
        </Text>

        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
          </Pressable>
        </Link>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Already have an account?</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.credits}>
        AI App Development powered by ServiceVision
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F5F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 8,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#2D5A3D',
    fontWeight: '500',
  },
  contentSection: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 17,
    lineHeight: 26,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#2D5A3D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A7C5C',
    fontSize: 15,
  },
  credits: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
  },
});
