import { Image, StyleSheet, TouchableOpacity } from 'react-native';

const BtnLogin = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Image
                source={require('../assets/icons/Btn_naver_icon.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 325,
        height: 52,
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '120%',
        height: '120%',
    },
});

export default BtnLogin;