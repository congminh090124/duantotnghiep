import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IncomingCallModal = ({ visible, callData, onAccept, onReject }) => {
    if (!visible || !callData) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Image
                        source={{ uri: callData.callerAvatar }}
                        style={styles.callerAvatar}
                    />
                    <Text style={styles.callerName}>{callData.callerName}</Text>
                    <Text style={styles.callStatus}>Đang gọi video...</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={onReject}
                        >
                            <Ionicons name="close-circle" size={30} color="#ff4444" />
                            <Text style={styles.buttonText}>Từ chối</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={onAccept}
                        >
                            <Ionicons name="videocam" size={30} color="#4CAF50" />
                            <Text style={styles.buttonText}>Chấp nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%'
    },
    callerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10
    },
    callerName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5
    },
    callStatus: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%'
    },
    button: {
        alignItems: 'center',
        padding: 10
    },
    buttonText: {
        marginTop: 5
    },
    acceptButton: {
        backgroundColor: '#e8f5e9',
        borderRadius: 10,
        padding: 15
    },
    rejectButton: {
        backgroundColor: '#ffebee',
        borderRadius: 10,
        padding: 15
    }
});

export default IncomingCallModal;