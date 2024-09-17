import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';

const messages = [
    {
        id: '1',
        text: 'Chào mọi người, hôm nay có ai rảnh không?',
        sender: 'me',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
        id: '2',
        text: 'Mình rảnh, có kế hoạch gì không?',
        sender: 'other',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    },
];

const ChatScreen = ({ navigation }) => {
    const renderMessage = ({ item }) => {
        const isMe = item.sender === 'me';
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
                {!isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                    <Text style={isMe ? styles.myText : styles.otherText}>{item.text}</Text>
                </View>
                {isMe && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90} // điều chỉnh khoảng cách nếu cần thiết
        >
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/back.png' }}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Hà An Duyệt</Text>
            </View>

            {/* Message List */}
            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
            />

            {/* Input Section */}
            <View style={styles.inputContainer}>
                <Image
                    source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                    style={styles.inputAvatar}
                />
                <TextInput placeholder="Nhập tin nhắn" style={styles.input} />
                <TouchableOpacity>
                    <Text style={styles.sendButton}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4C9AFF',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    backButton: {
        marginRight: 10,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold',
    },
    messageList: {
        padding: 10,
        flexGrow: 1,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    bubble: {
        maxWidth: '70%',
        padding: 10,
        borderRadius: 15,
    },
    myBubble: {
        backgroundColor: '#4C9AFF',
        borderBottomRightRadius: 0,
    },
    otherBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 0,
    },
    myText: {
        color: '#FFF',
    },
    otherText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderColor: '#E5E5EA',
        padding: 10,
        backgroundColor: '#FFF',
    },
    inputAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    sendButton: {
        color: '#4C9AFF',
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default ChatScreen;
