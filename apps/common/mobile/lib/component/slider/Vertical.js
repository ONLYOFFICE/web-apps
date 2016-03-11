Ext.define('Common.component.slider.Vertical', {
    extend: 'Ext.slider.Slider',
    xtype: 'verticalslider',

    config: {
        baseCls: 'x-slider-vertical',

//        cls: 'vertical',

        thumbConfig: {
            draggable: {
                direction: 'vertical'
            }
        }
    },

    refreshOffsetValueRatio: function() {
        var valueRange = this.getMaxValue() - this.getMinValue(),
            trackHeight = this.elementHeight - this.thumbHeight;

        this.offsetValueRatio = trackHeight / valueRange;
    },

    refreshElementHeight: function() {
        this.elementHeight = this.element.dom.offsetHeight;
        var thumb = this.getThumb(0);
        if (thumb) {
            this.thumbHeight = thumb.getElementWidth();
        }
    },

    refresh: function() {
        this.refreshElementHeight();
        this.refreshValue();
    },

    onThumbDragStart: function(thumb, e) {
        if (e.absDeltaY <= e.absDeltaX) {
            return false;
        }
        else {
            e.stopPropagation();
        }

        if (this.getAllowThumbsOverlapping()) {
            this.setActiveThumb(thumb);
        }

        this.dragStartValue = this.getValue()[this.getThumbIndex(thumb)];
        this.fireEvent('dragstart', this, thumb, this.dragStartValue, e);
    },

    onThumbDrag: function(thumb, e, offsetX, offsetY) {
        var index = this.getThumbIndex(thumb),
            offsetValueRatio = this.offsetValueRatio,
            constrainedValue = this.constrainValue(offsetY / offsetValueRatio);

        e.stopPropagation();

        this.setIndexValue(index, constrainedValue);

        this.fireEvent('drag', this, thumb, this.getValue(), e);

        return false;
    },

    setIndexValue: function(index, value, animation) {
        var thumb = this.getThumb(index),
            values = this.getValue(),
            offsetValueRatio = this.offsetValueRatio,
            draggable = thumb.getDraggable();

        draggable.setOffset(null, value * offsetValueRatio, animation);

        values[index] = this.constrainValue(draggable.getOffset().y / offsetValueRatio);
    },

    updateValue: function(newValue, oldValue) {
        var thumbs = this.getThumbs(),
            ln = newValue.length,
            i;

        this.setThumbsCount(ln);

        for (i = 0; i < ln; i++) {
            thumbs[i].getDraggable().setExtraConstraint(null)
                                    .setOffset(0, newValue[i] * this.offsetValueRatio);
        }

        for (i = 0; i < ln; i++) {
            this.refreshThumbConstraints(thumbs[i]);
        }
    },

    refreshThumbConstraints: function(thumb) {
        var allowThumbsOverlapping = this.getAllowThumbsOverlapping(),
            offsetY = thumb.getDraggable().getOffset().y,
            thumbs = this.getThumbs(),
            index = this.getThumbIndex(thumb),
            previousThumb = thumbs[index - 1],
            nextThumb = thumbs[index + 1],
            thumbHeight = this.thumbHeight;

        if (previousThumb) {
            previousThumb.getDraggable().addExtraConstraint({
                max: {
                    y: offsetY - ((allowThumbsOverlapping) ? 0 : thumbHeight)
                }
            });
        }

        if (nextThumb) {
            nextThumb.getDraggable().addExtraConstraint({
                min: {
                    y: offsetY + ((allowThumbsOverlapping) ? 0 : thumbHeight)
                }
            });
        }
    },

    // @private
    onTap: function(e) {
        if (this.isDisabled()) {
            return;
        }

        var targetElement = Ext.get(e.target);

        if (!targetElement || targetElement.hasCls('x-thumb')) {
            return;
        }

        var touchPointY = e.touch.point.y,
            element = this.element,
            elementY = element.getY(),
            offset = touchPointY - elementY - (this.thumbHeight / 2),
            value = this.constrainValue(offset / this.offsetValueRatio),
            values = this.getValue(),
            minDistance = Infinity,
            ln = values.length,
            i, absDistance, testValue, closestIndex, oldValue, thumb;

        if (ln === 1) {
            closestIndex = 0;
        }
        else {
            for (i = 0; i < ln; i++) {
                testValue = values[i];
                absDistance = Math.abs(testValue - value);

                if (absDistance < minDistance) {
                    minDistance = absDistance;
                    closestIndex = i;
                }
            }
        }

        oldValue = values[closestIndex];
        thumb = this.getThumb(closestIndex);

        this.setIndexValue(closestIndex, value, this.getAnimation());
        this.refreshThumbConstraints(thumb);

        if (oldValue !== value) {
            this.fireEvent('change', this, thumb, value, oldValue);
        }
    }

}, function() {
    //<deprecated product=touch since=2.0>
    /**
     * @cfg {Boolean} animationDuration
     * Animation duration in ms.
     * @removed 2.0.0 Use the duration property on the animation config instead.
     */
    Ext.deprecateProperty(this, 'animationDuration', null, "Ext.slider.Slider.animationDuration has been removed");
    //</deprecated>
});
