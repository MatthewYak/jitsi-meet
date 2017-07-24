/* @flow */

import React from 'react';
import {
    Dimensions,
    TouchableHighlight,
    TouchableWithoutFeedback,
    View
} from 'react-native';

import AbstractContainer from '../AbstractContainer';

/**
 * Represents a container of React Native/mobile {@link Component} children.
 *
 * @extends AbstractContainer
 */
export default class Container extends AbstractContainer {
    /**
     * {@code Container} component's property types.
     *
     * @static
     */
    static propTypes = AbstractContainer.propTypes;

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        // eslint-disable-next-line prefer-const
        let { onClick, style, touchFeedback, visible, ...props } = this.props;

        // onClick & touchFeedback
        (typeof touchFeedback === 'undefined') && (touchFeedback = onClick);

        // visible

        // The following property is responsible to hide/show this Container by
        // moving it out of site of the screen boundaries. An attempt to use the
        // opacity property was made in order to eventually implement a
        // fadeIn/fadeOut animation, however a known React Native problem was
        // discovered, which allows the view to still capture touch events even
        // if hidden.
        let visibilityStyle;

        if (typeof visible !== 'undefined' && !visible) {
            const windowDimensions = Dimensions.get('window');

            visibilityStyle = {
                bottom: -windowDimensions.height,
                right: -windowDimensions.width
            };
        }

        const renderParent = touchFeedback || onClick;

        if (!renderParent && visibilityStyle) {
            style = {
                ...style,
                ...visibilityStyle
            };
        }

        // eslint-disable-next-line object-property-newline
        let component = super._render(View, { ...props, style });

        if (renderParent) {
            const parentType
                = touchFeedback ? TouchableHighlight : TouchableWithoutFeedback;
            const parentProps = {};

            onClick && (parentProps.onPress = onClick);
            visibilityStyle && (parentProps.style = visibilityStyle);

            component = React.createElement(parentType, parentProps, component);
        }

        return component;
    }
}
