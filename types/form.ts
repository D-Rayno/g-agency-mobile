import { Control, RegisterOptions } from "react-hook-form";
import { TextInputProps as RNTextInputProps, StyleProp, TextStyle, ViewStyle } from "react-native";

export interface BaseInputProps {
    control: Control<any>;
    name: string;
    label?: string;
    helperText?: string;
    rules?: RegisterOptions;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    helperTextStyle?: StyleProp<TextStyle>;
    errorTextStyle?: StyleProp<TextStyle>;
    required?: boolean;
}

export interface TextInputProps extends BaseInputProps, Omit<RNTextInputProps, 'style'> {
    inputStyle?: StyleProp<TextStyle>;
}
