// Expo SDK 54: use metro config from 'expo/metro-config' (not '@expo/metro-config').
const { getDefaultConfig } = require('expo/metro-config');
module.exports = getDefaultConfig(__dirname);
