import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const NhanTinScreen = () => {
    const [find] = useState('');
    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <View>
            <SafeAreaView style={styles.sav}>

                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Image
                        source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text>Tin Nhắn</Text>
                
            </SafeAreaView>
        </View>

    );
};

const styles = StyleSheet.create({
    sav: {
        backgroundColor: 'red',
        marginTop: '9%',
    },



});

export default NhanTinScreen;