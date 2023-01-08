import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, Text, View } from 'react-native';
import { Divider, TouchableRipple } from 'react-native-paper';

import Button from '../../../base/ui/components/native/Button';
import Input from '../../../base/ui/components/native/Input';
import { BUTTON_TYPES } from '../../../base/ui/constants.native';
import styles
    from '../../../settings/components/native/styles';
import { ANSWERS_LIMIT, CHAR_LIMIT } from '../../constants';
import AbstractPollCreate from '../AbstractPollCreate';
import type { AbstractProps } from '../AbstractPollCreate';

import { chatStyles, dialogStyles } from './styles';


const PollCreate = (props: AbstractProps) => {
    const {
        addAnswer,
        answers,
        isSubmitDisabled,
        onSubmit,
        question,
        removeAnswer,
        setAnswer,
        setCreateMode,
        setQuestion,
        t
    } = props;

    const answerListRef = useRef(null);

    /*
     * This ref stores the Array of answer input fields, allowing us to focus on them.
     * This array is maintained by registerFieldRef and the useEffect below.
     */
    const answerInputs = useRef([]);
    const registerFieldRef = useCallback((i, input) => {
        if (input === null) {
            return;
        }
        answerInputs.current[i] = input;
    }, [ answerInputs ]);

    useEffect(() => {
        answerInputs.current = answerInputs.current.slice(0, answers.length);

    }, [ answers ]);

    /*
     * This state allows us to requestFocus asynchronously, without having to worry
     * about whether a newly created input field has been rendered yet or not.
     */
    const [ lastFocus, requestFocus ] = useState(null);
    const { PRIMARY, SECONDARY } = BUTTON_TYPES;

    useEffect(() => {
        if (lastFocus === null) {
            return;
        }
        const input = answerInputs.current[lastFocus];

        if (input === undefined) {
            return;
        }
        input.focus();

    }, [ answerInputs, lastFocus ]);


    const onQuestionKeyDown = useCallback(() => {
        answerInputs.current[0].focus();
    });

    // Called on keypress in answer fields
    const onAnswerKeyDown = useCallback((index: number, ev) => {
        const { key } = ev.nativeEvent;
        const currentText = answers[index];

        if (key === 'Backspace' && currentText === '' && answers.length > 1) {
            removeAnswer(index);
            requestFocus(index > 0 ? index - 1 : 0);
        }
    }, [ answers, addAnswer, removeAnswer, requestFocus ]);

    /* eslint-disable react/no-multi-comp */
    const createRemoveOptionButton = onPress => (
        <TouchableRipple
            onPress = { onPress }
            rippleColor = { 'transparent' } >
            <Text style = { dialogStyles.optionRemoveButtonText }>
                { t('polls.create.removeOption') }
            </Text>
        </TouchableRipple>
    );


    /* eslint-disable react/jsx-no-bind */
    const renderListItem = ({ index }: { index: number }) =>

        // padding to take into account the two default options
        (
            <View
                style = { dialogStyles.optionContainer }>
                <Input
                    blurOnSubmit = { false }
                    label = { t('polls.create.pollOption', { index: index + 1 }) }
                    maxLength = { CHAR_LIMIT }
                    multiline = { true }
                    onChange = { text => setAnswer(index, text) }
                    onKeyPress = { ev => onAnswerKeyDown(index, ev) }
                    placeholder = { t('polls.create.answerPlaceholder', { index: index + 1 }) }
                    ref = { input => registerFieldRef(index, input) }
                    value = { answers[index] } />
                {
                    answers.length > 2
                    && createRemoveOptionButton(() => removeAnswer(index))
                }
            </View>
        );
    const buttonRowStyles = Platform.OS === 'android'
        ? chatStyles.buttonRowAndroid : chatStyles.buttonRowIos;

    return (
        <View style = { chatStyles.pollCreateContainer }>
            <View style = { chatStyles.pollCreateSubContainer }>
                <Input
                    autoFocus = { true }
                    blurOnSubmit = { false }
                    customStyles = {{ container: dialogStyles.customContainer }}
                    label = { t('polls.create.pollQuestion') }
                    maxLength = { CHAR_LIMIT }
                    multiline = { true }
                    onChange = { setQuestion }
                    onSubmitEditing = { onQuestionKeyDown }
                    placeholder = { t('polls.create.questionPlaceholder') }
                    value = { question } />
                <Divider style = { styles.fieldSeparator } />
                <FlatList
                    blurOnSubmit = { true }
                    data = { answers }
                    extraData = { answers }
                    keyExtractor = { (item, index) => index.toString() }
                    ref = { answerListRef }
                    renderItem = { renderListItem } />
                <View style = { chatStyles.pollCreateButtonsContainer }>
                    <Button
                        accessibilityLabel = 'polls.create.addOption'
                        disabled = { answers.length >= ANSWERS_LIMIT }
                        labelKey = 'polls.create.addOption'
                        onClick = { () => {
                            // adding and answer
                            addAnswer();
                            requestFocus(answers.length);
                        } }
                        style = { chatStyles.pollCreateAddButton }
                        type = { SECONDARY } />
                    <View
                        style = { buttonRowStyles }>
                        <Button
                            accessibilityLabel = 'polls.create.cancel'
                            labelKey = 'polls.create.cancel'
                            onClick = { () => setCreateMode(false) }
                            style = { chatStyles.pollCreateButton }
                            type = { SECONDARY } />
                        <Button
                            accessibilityLabel = 'polls.create.send'
                            disabled = { isSubmitDisabled }
                            labelKey = 'polls.create.send'
                            onClick = { onSubmit }
                            style = { chatStyles.pollCreateButton }
                            type = { PRIMARY } />
                    </View>
                </View>
            </View>
        </View>
    );
};

/*
 * We apply AbstractPollCreate to fill in the AbstractProps common
 * to both the web and native implementations.
 */
// eslint-disable-next-line new-cap
export default AbstractPollCreate(PollCreate);
