// @flow

import { batch } from 'react-redux';
import type { Dispatch } from 'redux';

import { CHAT_SIZE } from '../../chat/constants';
import { getParticipantsPaneOpen } from '../../participants-pane/functions';
import theme from '../../participants-pane/theme.json';

import { CLIENT_RESIZED, SET_ASPECT_RATIO, SET_CONTEXT_MENU_OPEN, SET_REDUCED_UI } from './actionTypes';
import { ASPECT_RATIO_NARROW, ASPECT_RATIO_WIDE } from './constants';

/**
 * Size threshold for determining if we are in reduced UI mode or not.
 *
 * FIXME The logic to base {@code reducedUI} on a hardcoded width or height is
 * very brittle because it's completely disconnected from the UI which wants to
 * be rendered and, naturally, it broke on iPad where even the secondary Toolbar
 * didn't fit in the height. We do need to measure the actual UI at runtime and
 * determine whether and how to render it.
 */
const REDUCED_UI_THRESHOLD = 300;

/**
 * Indicates a resize of the window.
 *
 * @param {number} clientWidth - The width of the window.
 * @param {number} clientHeight - The height of the window.
 * @returns {Object}
 */
export function clientResized(clientWidth: number, clientHeight: number) {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const { isOpen: isChatOpen } = state['features/chat'];
        const isParticipantsPaneOpen = getParticipantsPaneOpen(state);
        let availableWidth = clientWidth;

        if (navigator.product !== 'ReactNative') {
            if (isChatOpen) {
                availableWidth -= CHAT_SIZE;
            }

            if (isParticipantsPaneOpen) {
                availableWidth -= theme.participantsPaneWidth;
            }
        }

        batch(() => {
            dispatch({
                type: CLIENT_RESIZED,
                clientHeight,
                clientWidth: availableWidth
            });
            dispatch(setAspectRatio(clientWidth, clientHeight));
        });
    };
}

/**
 * Sets the aspect ratio of the app's user interface based on specific width and
 * height.
 *
 * @param {number} width - The width of the app's user interface.
 * @param {number} height - The height of the app's user interface.
 * @returns {{
 *     type: SET_ASPECT_RATIO,
 *     aspectRatio: Symbol
 * }}
 */
export function setAspectRatio(width: number, height: number): Function {
    return (dispatch: Dispatch<any>, getState: Function) => {
        // Don't change the aspect ratio if width and height are the same, that
        // is, if we transition to a 1:1 aspect ratio.
        if (width !== height) {
            const aspectRatio
                = width < height ? ASPECT_RATIO_NARROW : ASPECT_RATIO_WIDE;

            if (aspectRatio
                    !== getState()['features/base/responsive-ui'].aspectRatio) {
                return dispatch({
                    type: SET_ASPECT_RATIO,
                    aspectRatio
                });
            }
        }
    };
}

/**
 * Sets the "reduced UI" property. In reduced UI mode some components will
 * be hidden if there is no space to render them.
 *
 * @param {number} width - Current usable width.
 * @param {number} height - Current usable height.
 * @returns {{
 *     type: SET_REDUCED_UI,
 *     reducedUI: boolean
 * }}
 */
export function setReducedUI(width: number, height: number): Function {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const reducedUI = Math.min(width, height) < REDUCED_UI_THRESHOLD;

        if (reducedUI !== getState()['features/base/responsive-ui'].reducedUI) {
            return dispatch({
                type: SET_REDUCED_UI,
                reducedUI
            });
        }
    };
}

/**
 * Sets whether the local or remote participant context menu is open.
 *
 * @param {boolean} isOpen - Whether local or remote context menu is open.
 * @returns {Object}
 */
export function setParticipantContextMenuOpen(isOpen: boolean) {
    return {
        type: SET_CONTEXT_MENU_OPEN,
        isOpen
    };
}
