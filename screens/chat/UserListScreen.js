import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { fetchUsersData } from '../../apiConfig';

const UserListScreen = ({ navigation }) => {
    const [usersData, setUsersData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await fetchUsersData();
            setUsersData(users);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const renderUser = ({ item }) => (
        <TouchableOpacity 
            style={styles.userContainer} 
            onPress={() => navigation.navigate('Chat', { userId: item._id, username: item.username })}
            //, { userId: item._id, username: item.username }
        >
            <Image source={{ uri: item.anhdaidien || 'https://via.placeholder.com/50' }} style={styles.userAvatar} />
            <Text style={styles.userName}>{item.username || 'User'}</Text>
        </TouchableOpacity>
    );

    const filteredUsersData = usersData.filter(user => 
        user && user.username && user.username.toLowerCase().includes(searchText.toLowerCase())
    );

    if (isLoading) {
        return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
    }

    return (
        <View style={styles.container}>
            <TextInput 
                style={styles.searchBar} 
                placeholder="Tìm kiếm" 
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredUsersData}
                renderItem={renderUser}
                keyExtractor={(item) => item._id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
    },
});

export default UserListScreen;