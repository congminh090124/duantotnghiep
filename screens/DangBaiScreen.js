import React, { useState } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const DangBaiScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');


    const [find] = useState('');
    const handleBack = () => {
        navigation.goBack();
    };


    return (
        <ScrollView style={{backgroundColor:'#fff'}}>
             <SafeAreaView style={styles.container}>

            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Image
                    source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
                    style={styles.backIcon}
                />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.headerText}>Tạo bài đăng tìm bạn đồng hành</Text>
            </View>

            <View style={styles.rowAnh}>

                <Image
                    // icon kính lúp
                    source={{ uri: "https://cdn-icons-png.flaticon.com/128/2951/2951086.png" }}
                    style={styles.image}
                />
                <Text style={styles.cab}>Chọn ảnh bìa</Text>

                <TouchableOpacity style={styles.btnThem} onPress={handleBack}>
                    <Text style={{ textAlign: 'center', color: '#000', marginTop: '4%' }}>Thêm</Text>
                </TouchableOpacity>


            </View>
            <View style={styles.inputContainer}>
                <Text style={{fontSize:17, fontWeight: 'bold'}}>Tiêu đề chuyến đi</Text>
                <Text style={{ fontWeight: 'normal', fontSize: 15, marginBottom: '1%', marginTop: '5%' }}>Nhập tiêu đề của chuyến đi, ví dụ: 'Du lịch hạ long'</Text>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Chi tiết chuyến đi</Text>
                <TouchableOpacity style={styles.button}>
                    <Image
                        // icon lich
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                        style={styles.image2}
                    />
                    <Text style={styles.buttonText}>Ngày bắt đầu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                <Image
                        // icon lich
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }}
                        style={styles.image2}
                    />
                    <Text style={styles.buttonText}>Ngày kết thúc</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                <Image
                        // icon lich
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/819/819865.png" }}
                        style={styles.image2}
                    />
                    <Text style={styles.buttonText}>Điểm đến</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.mtcdv}>
                <Text style={styles.label}>Mô tả chuyến đi</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Mô tả kế hoạch du lịch của bạn"
                    multiline={true}
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />
            </View>
            <View style={styles.nsv}>
                <Text style={{marginTop:'-4%', fontWeight:'bold',fontSize:18, marginBottom:'3%'}}>Ngân sách</Text>
                <TextInput
                    style={styles.input}
                    placeholder="$1000 - $2000"
                    value={budget}
                    onChangeText={setBudget}
                />
                 <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Tạo bài đăng</Text>
            </TouchableOpacity>
            </View>
           
        </SafeAreaView>
        </ScrollView>
       
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F6F8F9',
        marginTop: "5%",
        height:'100%'
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: "5%",
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: "5%",
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius:10,
        padding: 10,
        marginBottom: "5%",
    },
    textArea: {
        height: "30%",
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius:10,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#fff',
        padding: 3,
        height:'15%',
        marginBottom: 5,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 15,
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: 16,
        marginLeft: '6%',
        marginTop: '3%',
        

    },
    submitButton: {
        backgroundColor: 'blue',
        alignItems: 'center',
        height:'18%',
        justifyContent:'center',
        borderRadius : 10
        
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },

    backButton: {
        marginRight: "20%",

        width: "10%",
    },
    rowAnh: {
        width: '95%',
        height: '6%',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: '4%'
    },
    cab: {
        marginLeft: '15%',
        marginTop: '-6%',
    },
    image: {
        width: 25,
        height: 25,
        marginTop: '3%',
        // marginRight: 33,
        marginLeft: "5%"
    },
    btnThem: {
        marginLeft: "70%",
        marginTop: '-6%',
        backgroundColor: '#EBEDED',
        borderRadius: 10,
        width: '20%',
        height: '60%',
        // marginBottom:
    },
    image2: {
        height: 22,
        width: 22,
        marginLeft: '3%',
        marginTop: '3%',
        // backgroundColor: 'red',
    },
    mtcdv:{
     bottom:150
    },
    nsv:{
        bottom:300,
        // backgroundColor:'red',
        marginTop: '10%',
    }
});

export default DangBaiScreen;
