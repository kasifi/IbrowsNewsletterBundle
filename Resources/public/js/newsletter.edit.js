var ns = ibrows_newsletter.namespace('ibrows_newsletter');

ns.edit = function($options){
    
    var $self = this;
    var $options = $options;
    
    var $container = null;
    var $elements = {};
    
    this.ready = function(){
        $container = jQuery($options.container);
        
        for(var elemSelectorKey in $options.elements){
            var elemSelector = $options.elements[elemSelectorKey];
            $elements[elemSelectorKey] = $container.find(elemSelector);
        }

        $self.setupNewBlockDialog();
        $self.setupCloneBlockDialog();
        $self.setupBlockSortable();
        $self.setupBlockDeleteDroppable();
    }
    
    this.setupBlockSortable = function(){
        $($elements.blocks).sortable({
            placeholder: "ui-state-highlight",
            cursor: 'move',
            cursorAt: {left: 0, top: 0},
            update: function($event, $ui){
                $self.updateBlockPositions();
            },
            helper: function($event, $ui){
                return '<li class="helper" style="width:50px;height:50px;"></li>'
            },
            start: function($event, $ui){
                jQuery($ui.item).find($options.selectors.tinymce).each(function(){
                    tinyMCE.execCommand('mceRemoveControl', false, jQuery(this).attr('id'));
                });
                jQuery($elements.blockDeleteDroppable).show();
            },
            stop: function($event, $ui){
                jQuery($ui.item).find($options.selectors.tinymce).each(function(){
                    tinyMCE.execCommand('mceAddControl', false, jQuery(this).attr('id'));
                });
                jQuery($elements.blockDeleteDroppable).hide();
            }
        });
    }
    
    this.setupBlockDeleteDroppable = function(){
        jQuery($elements.blockDeleteDroppable).droppable({
            tolerance: 'pointer',
            accept: $options.selectors.block,
            hoverClass: 'hover',
            drop: function($event, $ui){
                $self.deleteBlock(jQuery($ui.draggable));
            }
        });
    }
    
    this.deleteBlock = function($block){
        $block.remove();
        jQuery.post($options.url.removeBlock, {
            id: $block.data('element-id')
        });
    }
    
    this.updateBlockPositions = function(){
        jQuery.post($options.url.updateBlockPosition, {
            positions: this.getBlockPositions()
        });
    }
    
    this.getBlockPositions = function(){
        var $positions = {};
        var $position = 1;
        $elements.blocks.find($options.selectors.block).each(function(){
            $positions[jQuery(this).attr($options.attributes.blockId)] = $position++;
        });
        return $positions;
    }
    
    this.setupNewBlockDialog = function(){
        $elements.newBlockDialogButton.click(function($event){
            $event.preventDefault();
            $elements.newBlockDialog.dialog('open');
        });
        
        $elements.newBlockDialogAdd.click(function($event){
            $event.preventDefault();
            
            var $button = jQuery($event.currentTarget);
            var $form = $button.closest('[data-element="new-block-dialog-provider-form"]');
            
            var $options = {};
            $form.find('[data-form-field="true"]').each(function(){
                var $formField = jQuery(this);
                $options[$formField.attr('name')] = $formField.val();
            });
            
            $self.addProviderBlock($elements.blocks, $options);
        });
        
        var buttons = {};
        buttons[$options.trans['newsletter.dialog.abort']] = function($event){
            $elements.newBlockDialog.dialog('close');
        };
        
        $elements.newBlockDialog.dialog({
            autoOpen: false,
            modal: true,
            buttons: buttons,
            width: '600',
            position: 'center',
            close: function($event, $ui){
                //jQuery($elements.newBlockDialog).find(':input').val('');
            }
        });
        
        $elements.newBlockDialogAccordion.accordion({
            heightStyle: 'content'
        });
    }

    this.setupCloneBlockDialog = function(){
        $elements.cloneBlockDialogButton.click(function($event){
            $event.preventDefault();
            $elements.cloneBlockDialog.dialog('open');
        });

        var buttons = {};
        buttons[$options.trans['newsletter.dialog.abort']] = function($event){
            $elements.cloneBlockDialog.dialog('close');
        };

        $elements.cloneBlockDialog.dialog({
            autoOpen: false,
            modal: true,
            buttons: buttons,
            width: '600',
            position: 'center'
        });

        jQuery($elements.cloneBlockButton).click(function($event){
            $event.preventDefault();
            var $button = jQuery($event.currentTarget);
            var $newsletterId = $button.data('newsletter-id');
            jQuery($elements.cloneBlockNewsletterId).val($newsletterId);
            jQuery($elements.blocksForm).submit();
        });
    }
    
    this.addProviderBlock = function($parent, $data){
        $elements.newBlockDialog.dialog('close');
        $data.position = $elements.blocks.find($options.selectors.block).length+1;
        jQuery.post(
            $options.url.addProviderBlock, 
            $data, 
            function($response){
                $parent.append($response.html);
                jQuery($response.html).find($options.selectors.tinymce).each(function(){
                    tinyMCE.execCommand('mceAddControl', false, jQuery(this).attr('id'));
                });
            }
        );
    }
    
}
