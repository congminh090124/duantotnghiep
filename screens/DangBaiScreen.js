import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';


const DangBaiScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // code khai báo liên quan đến ngày tháng
    const [startDate, setStartDate] = useState("Ngày bắt đầu");
    const [endDate, setEndDate] = useState("Ngày kết thúc");
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    // code khai báo liên quan đến ảnh
    const [selectedImage, setSelectedImage] = useState(null);
    // code khai báo liên quan đến navigation bar
    const navigation = useNavigation(); // Access navigation prop



    const [budget, setBudget] = useState(null);
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([
        { label: '$1000 - $2000', value: '$1000 - $2000' },
        { label: '$2000 - $3000', value: '$2000 - $3000' },
        { label: '$3000 - $4000', value: '$3000 - $4000' },
        { label: '$4000 - $5000', value: '$4000 - $5000' },
        { label: 'Thỏa thuận', value: 'Thỏa thuận' },
    ]);

    // code logic
    const handleBack = () => {
        navigation.goBack();
    };

    // Hàm mở thư viện ảnh
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert('Bạn cần cấp quyền truy cập thư viện ảnh!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    // Hàm về ngày tháng
    const onStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowStartDatePicker(false);
        setStartDate(currentDate.toLocaleDateString());  // Cập nhật ngày bắt đầu
    };

    const onEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowEndDatePicker(false);
        setEndDate(currentDate.toLocaleDateString());  // Cập nhật ngày kết thúc
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Điều chỉnh offset phù hợp
            >
                <FlatList
                    data={[{ key: '1' }]} // Sử dụng một data array giả
                    renderItem={() => (
                        <View>

                            <View>
                                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                                    <Image
                                        source={require('../assets/back.png')}
                                        style={styles.backIcon}
                                    />
                                </TouchableOpacity>

                                <View style={styles.header}>
                                    <Text style={styles.headerText}>Tạo bài đăng  </Text>
                                </View>
                            </View>


                            <View style={styles.rowAnh}>
                                <Image
                                   source={
                                    selectedImage 
                                      ? { uri: selectedImage } 
                                      : require('../assets/image.png')
                                  }
                                    style={styles.image}
                                />
                                <Text style={styles.cab}>Chọn ảnh </Text>
                                <TouchableOpacity style={styles.btnThem} onPress={pickImage}>
                                    <Text style={styles.btnThemText}>Thêm</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.titleLabel}>Tiêu đề </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tiêu đề của bạn"
                                    value={title}
                                    onChangeText={setTitle}
                                    multiline={true}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Chi tiết  </Text>
                                <TouchableOpacity style={styles.button} onPress={() => setShowStartDatePicker(true)}>
                                    <Image
                                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                                        style={styles.image2}
                                    />
                                    <Text style={styles.buttonText}>{startDate}</Text>
                                    {showStartDatePicker && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'calendar' : 'default'}
                                            onChange={onStartDateChange}
                                            style={{ right: '-270%' }}
                                        />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button} onPress={() => setShowEndDatePicker(true)}>
                                    <Image
                                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                                        style={styles.image2}
                                    />
                                    <Text style={styles.buttonText}>{endDate}</Text>
                                    {showEndDatePicker && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'calendar' : 'default'}
                                            onChange={onEndDateChange}
                                            style={{ right: '-270%' }}
                                        />
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button}>
                                    <Image
                                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/819/819865.png" }}
                                        style={styles.image2}
                                    />
                                    <Text style={styles.buttonText}>Điểm đến</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.textAreaContainer}>
                                <Text style={styles.label}>Mô tả  </Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Mô tả kế hoạch du lịch của bạn"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline={true}
                                />
                            </View>

                            <View style={styles.budgetContainer}>
                                <Text style={{ marginBottom: '3%', fontWeight:'bold',fontSize:18 }}>Ngân sách</Text>
                                <DropDownPicker
                                    open={open}
                                    value={budget}
                                    items={items}
                                    setOpen={setOpen}
                                    setValue={setBudget}
                                    setItems={setItems}
                                    placeholder="Chọn ngân sách"
                                    style={styles.dropdown} // Thêm style nếu cần
                                    dropDownContainerStyle={styles.dropdownContainer} // Thêm style nếu cần
                                />

                                <TouchableOpacity style={styles.submitButton}>
                                    <Text style={styles.submitButtonText}>Tạo bài đăng</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item) => item.key}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 20,
        paddingLeft: '10%'
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    titleLabel: {
        marginBottom: 5,
        fontSize: 17,
        fontWeight: 'bold',
    },
    input: {
        height: 66,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    textArea: {
        height: 120,
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#fff',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: 'orange',
        padding: 15,
        borderRadius: 10,
        marginBottom: '10%',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 20,
        height: 20,
        resizeMode: 'cover',
        marginLeft: 10,
        marginBottom: '2%',
        marginTop: '2%',
    },
    image2: {
        width: 20,
        height: 20,
    },
    cab: {
        marginTop: '1%',
        marginLeft:'3%'
    },
    btnThem: {
        marginTop: '1%',
        marginLeft:'45%',
        backgroundColor: 'orange',
        paddingHorizontal: '3%',
        paddingVertical: '1%',
        borderRadius: 5,
        
    },
    btnThemText: {
        color: '#fff',
    },
    textAreaContainer: {
        marginBottom: 20,
    },
    rowAnh: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dropdown: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        height: 50,
        marginBottom: '5%'
    },
    dropdownContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: '32%'
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 1,
        marginTop: '1%',
    },
    backIcon: {
        width: 20,
        height: 20,
    },
});

export default DangBaiScreen;
