    import React, { useState } from 'react';
    import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
    import { Ionicons } from '@expo/vector-icons';

    const CompanionSearchScreen = () => {
    const [selectedInterest, setSelectedInterest] = useState('Phiêu lưu');
    
    const users = [
        { id: 1, name: 'Hà An Duyệt', age: 28, interest: 'Leo núi', image: 'https://i.pinimg.com/236x/cd/31/9a/cd319afe4185690b31e07794548544dc.jpg' },
        { id: 2, name: 'Hà An Duyệt', age: 25, interest: 'Đi bộ đường dài', image: 'https://i.pinimg.com/474x/a1/77/5e/a1775ee11305031b51db51172f62cb4b.jpg' },
        { id: 3, name: 'Hà An Duyệt', age: 30, interest: 'Tìm bạn đồng hành', image: 'https://i.pinimg.com/236x/bf/b6/82/bfb6828201c1fb05ae48072ac62730ab.jpg' },
        { id: 4, name: 'Hà An Duyệt', age: 27, interest: 'Khám phá', image: 'https://i.pinimg.com/474x/14/6b/bc/146bbc2c54bd796bfe0fa1da8579a9e7.jpg' },
        { id: 5, name: 'Hà An Duyệt', age: 29, interest: 'Đi dạo', image: 'https://i.pinimg.com/236x/4b/e9/2b/4be92bd8a77b301bb5936309d4b53501.jpg' },
        { id: 6, name: 'Hà An Duyệt', age: 26, interest: 'Dã ngoại', image: 'https://i.pinimg.com/474x/38/1d/be/381dbe5ae4326cce87e6892a94500141.jpg' },
    ];

    return (
        <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={24} color="gray" style={styles.searchIcon} />
            <TextInput
            placeholder="Tìm kiếm bạn đồng hành"
            style={styles.searchInput}
            />
        </View>

        {/* Location Filter */}
        <Text style={styles.sectionTitle}>Tìm bạn đồng hành</Text>
        <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterButton}>
            <Text>Hà Nội</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
            <Text>Đà Nẵng</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
            <Text>TP. Hồ Chí Minh</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
        </View>

        {/* Date Filter */}
        <Text style={styles.sectionTitle}>Chọn Ngày</Text>
        <View style={styles.filterContainer}>
            <TouchableOpacity style={styles.filterButton}>
            <Text>Tháng 10</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
            <Text>Tháng 11</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
            <Text>Tháng 12</Text>
            <Ionicons name="caret-down" size={16} color="gray" />
            </TouchableOpacity>
        </View>

        {/* Interests */}
        <Text style={styles.sectionTitle}>Sở thích</Text>
        <View style={styles.interestContainer}>
            <TouchableOpacity
            style={[
                styles.interestButton,
                selectedInterest === 'Phiêu lưu' && styles.selectedInterestButton,
            ]}
            onPress={() => setSelectedInterest('Phiêu lưu')}
            >
            <Text style={selectedInterest === 'Phiêu lưu' ? styles.selectedInterestText : styles.interestText}>
                Phiêu lưu
            </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[
                styles.interestButton,
                selectedInterest === 'Văn hoá' && styles.selectedInterestButton,
            ]}
            onPress={() => setSelectedInterest('Văn hoá')}
            >
            <Text style={selectedInterest === 'Văn hoá' ? styles.selectedInterestText : styles.interestText}>
                Văn hoá
            </Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[
                styles.interestButton,
                selectedInterest === 'Thư giãn' && styles.selectedInterestButton,
            ]}
            onPress={() => setSelectedInterest('Thư giãn')}
            >
            <Text style={selectedInterest === 'Thư giãn' ? styles.selectedInterestText : styles.interestText}>
                Thư giãn
            </Text>
            </TouchableOpacity>
        </View>

        {/* User List */}
       {/* Scrollable User List */}
      <ScrollView style={styles.userList}>
        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <Image source={{ uri: user.image }} style={styles.userImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}, {user.age}</Text>
              <Text style={styles.userInterest}>{user.interest}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
        </View>
    );
    };

    const styles = StyleSheet.create({
    container: {
        marginTop:"10%",
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    filterButton: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    interestContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    interestButton: {
        backgroundColor: '#f1f1f1',
        padding: 10,
        borderRadius: 20,
        paddingHorizontal: 20,
    },
    selectedInterestButton: {
        backgroundColor: '#0066FF',
    },
    interestText: {
        color: '#000',
    },
    selectedInterestText: {
        color: '#fff',
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userInterest: {
        fontSize: 14,
        color: 'gray',
    },
    });

    export default CompanionSearchScreen;
