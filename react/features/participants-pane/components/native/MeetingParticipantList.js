// @flow

import React, { PureComponent } from 'react';
import { FlatList } from 'react-native';


import { translate } from '../../../base/i18n';
import { Icon, IconAddUser } from '../../../base/icons';
import { getLocalParticipant, getParticipantCountWithFake, getRemoteParticipants } from '../../../base/participants';
import { connect } from '../../../base/redux';
import Button from '../../../base/ui/components/native/Button';
import Input from '../../../base/ui/components/native/Input';
import { BUTTON_TYPES } from '../../../base/ui/constants.native';
import { getBreakoutRooms, getCurrentRoomId } from '../../../breakout-rooms/functions';
import { doInvitePeople } from '../../../invite/actions.native';
import { participantMatchesSearch, shouldRenderInviteButton } from '../../functions';

import CollapsibleList from './CollapsibleList';
import MeetingParticipantItem from './MeetingParticipantItem';
import styles from './styles';


type Props = {

    /**
     * Current breakout room, if we are in one.
     */
    _currentRoom: ?Object,

    /**
     * The local participant.
     */
    _localParticipant: Object,

    /**
     * The number of participants in the conference.
     */
    _participantsCount: number,

    /**
     * The remote participants.
     */
    _remoteParticipants: Map<string, Object>,

    /**
     * Whether or not to show the invite button.
     */
    _showInviteButton: boolean,

    /**
     * The remote participants.
     */
    _sortedRemoteParticipants: Map<string, string>,

    /**
     * List of breakout rooms that were created.
     */
    breakoutRooms: Array,

    /**
     * The redux dispatch function.
     */
    dispatch: Function,

    /**
     * Is the local participant moderator?
     */
    isLocalModerator: boolean,

    /**
     * List of participants waiting in lobby.
     */
    lobbyParticipants: Array,

    /**
     * Participants search string.
     */
    searchString: string,

    /**
     * Function to update the search string.
     */
    setSearchString: Function,

    /**
     * Translation function.
     */
    t: Function
}

/**
 *  The meeting participant list component.
 */
class MeetingParticipantList extends PureComponent<Props> {

    /**
     * Creates new MeetingParticipantList instance.
     *
     * @param {Props} props - The props of the component.
     */
    constructor(props: Props) {
        super(props);

        this._keyExtractor = this._keyExtractor.bind(this);
        this._onInvite = this._onInvite.bind(this);
        this._renderParticipant = this._renderParticipant.bind(this);
        this._onSearchStringChange = this._onSearchStringChange.bind(this);
    }

    _keyExtractor: Function;

    /**
     * Returns a key for a passed item of the list.
     *
     * @param {string} item - The user ID.
     * @returns {string} - The user ID.
     */
    _keyExtractor(item) {
        return item;
    }

    _onInvite: () => void;

    /**
     * Handles ivite button presses.
     *
     * @returns {void}
     */
    _onInvite() {
        this.props.dispatch(doInvitePeople());
    }

    /**
     * Renders the "invite more" icon.
     *
     * @returns {ReactElement}
     */
    _renderInviteMoreIcon() {
        return (
            <Icon
                size = { 20 }
                src = { IconAddUser } />
        );
    }

    _renderParticipant: Object => Object;

    /**
     * Renders a participant.
     *
     * @param {Object} flatListItem - Information about the item to be rendered.
     * @param {string} flatListItem.item - The ID of the participant.
     * @returns {ReactElement}
     */
    _renderParticipant({ item/* , index, separators */ }) {
        const { _localParticipant, _remoteParticipants, searchString } = this.props;
        const participant = item === _localParticipant?.id ? _localParticipant : _remoteParticipants.get(item);

        if (participantMatchesSearch(participant, searchString)) {
            return (
                <MeetingParticipantItem
                    key = { item }
                    participant = { participant } />
            );
        }

        return null;
    }

    _onSearchStringChange: (text: string) => void;

    /**
     * Handles search string changes.
     *
     * @param {string} text - New value of the search string.
     * @returns {void}
     */
    _onSearchStringChange(text: string) {
        this.props.setSearchString(text);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            _currentRoom,
            _localParticipant,
            _participantsCount,
            _showInviteButton,
            _sortedRemoteParticipants,
            breakoutRooms,
            isLocalModerator,
            lobbyParticipants,
            t
        } = this.props;
        const title = _currentRoom?.name

            // $FlowExpectedError
            ? `${_currentRoom.name} (${_participantsCount})`
            : t('participantsPane.headings.participantsList',
                { count: _participantsCount });

        // Regarding the fact that we have 3 sections, we apply
        // a certain height percentage for every section in order for all to fit
        // inside the participants pane container
        // If there are only meeting participants available,
        // we take the full container height
        const onlyMeetingParticipants
            = breakoutRooms?.length === 0 && lobbyParticipants?.length === 0;
        const containerStyleModerator
            = onlyMeetingParticipants
                ? styles.meetingListFullContainer : styles.meetingListContainer;
        const containerStyle
            = isLocalModerator
                ? containerStyleModerator : styles.notLocalModeratorContainer;
        const finalContainerStyle
            = _participantsCount > 6 && containerStyle;

        return (
            <CollapsibleList
                containerStyle = { finalContainerStyle }
                title = { title } >
                {
                    _showInviteButton
                    && <Button
                        accessibilityLabel = 'participantsPane.actions.invite'
                        icon = { this._renderInviteMoreIcon }
                        labelKey = 'participantsPane.actions.invite'
                        onClick = { this._onInvite }
                        style = { styles.inviteButton }
                        type = { BUTTON_TYPES.PRIMARY } />
                }
                <Input
                    clearable = { true }
                    customStyles = {{
                        container: styles.inputContainer,
                        input: styles.centerInput }}
                    onChange = { this._onSearchStringChange }
                    placeholder = { t('participantsPane.search') }
                    value = { this.props.searchString } />
                <FlatList
                    bounces = { false }
                    data = { [ _localParticipant?.id, ..._sortedRemoteParticipants ] }
                    horizontal = { false }
                    keyExtractor = { this._keyExtractor }
                    renderItem = { this._renderParticipant }
                    scrollEnabled = { true }
                    showsHorizontalScrollIndicator = { false }
                    windowSize = { 2 } />
            </CollapsibleList>
        );
    }
}

/**
 * Maps (parts of) the redux state to the associated props for this component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state): Object {
    const _participantsCount = getParticipantCountWithFake(state);
    const { remoteParticipants } = state['features/filmstrip'];
    const _showInviteButton = shouldRenderInviteButton(state);
    const _remoteParticipants = getRemoteParticipants(state);
    const currentRoomId = getCurrentRoomId(state);
    const _currentRoom = getBreakoutRooms(state)[currentRoomId];

    return {
        _currentRoom,
        _participantsCount,
        _remoteParticipants,
        _showInviteButton,
        _sortedRemoteParticipants: remoteParticipants,
        _localParticipant: getLocalParticipant(state)
    };
}

export default translate(connect(_mapStateToProps)(MeetingParticipantList));
