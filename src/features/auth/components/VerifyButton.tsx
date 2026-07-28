import React from 'react';

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native';

import {
    Colors,
    Spacing,
} from '../../../core/theme';

interface Props {

    loading?: boolean;

    verified?: boolean;

    title: string;

    onPress(): void;
}

const VerifyButton = ({
    loading,

    verified,

    title,

    onPress,
}: Props) => {

    return (

        <Pressable
            style={[
                styles.button,

                verified &&
                styles.verified,
            ]}
            disabled={
                loading || verified
            }
            onPress={onPress}>

            {loading ? (

                <ActivityIndicator
                    color={Colors.white}
                />

            ) : (

                <Text
                    style={styles.text}>

                    {verified
                        ? 'Verified'
                        : title}

                </Text>

            )}

        </Pressable>
    );
};

export default VerifyButton;

const styles =
    StyleSheet.create({

        button: {

            marginTop: 10,

            height: 48,

            borderRadius: 10,

            justifyContent: 'center',

            alignItems: 'center',

            backgroundColor:
                Colors.primary,
        },

        verified: {

            backgroundColor:
                Colors.success,
        },

        text: {

            color: Colors.white,

            fontWeight: '600',

            fontSize: 15,
        },
    }
);