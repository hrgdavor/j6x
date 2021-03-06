(function(j6x){

j6x._xClickCancel = function(el, end){
	
	// if disabled at any level 
	if(el.hasAttribute(j6x.disabledAttribute)) return true;
	
	// if listen is on the root node of component
	if(el === end) return false;

	// do not mess with other components, except Base (used for in cases where not specified, but needed)
	comp = el.getAttribute('as');
	return (comp && el != this.el && !(comp == 'Base' || comp =='Base' )); 
};

j6x._xClickEventData = function(el,domEvent, end){
	var events = [], actions = [], comp, cancelClick = false;
	while(true){
		if(j6x._xClickCancel(el, end)) cancelClick = true;

		if(el.hasAttribute('event')) events.push(el.getAttribute('event'));
		if(el.hasAttribute('action')) actions.push(el.getAttribute('action'));

		if(el == end) break;
		el = el.parentNode;
	}
	
	return {
			action:actions[0],
			actions,
			events,
			name: events[0],
			domEvent,
			cancelClick,
			target: el,
			required: true,
			fireTo: 'parent'
		};
};

j6x.xclick = function(comp, attrValue){
	// udpaters not needed
	j6x._xClickListen(comp.el,attrValue,null,comp);
}

j6x._xClickListen = function(n, attrValue, updaters, parentComp){
	if(!parentComp) return;
	parentComp.listen(n,'click',function(evt){
		try{
			var evtData = j6x._xClickEventData(evt.target, evt, n);
			var context;

			if(typeof attrValue == 'function'){
				context = attrValue(evt, evtData.action);
			}else if(typeof attrValue == 'string' && !evtData.name){
				evtData.name = attrValue;
			}

			evtData.context = context;

			// WORKAROUND to be compatible with base/Button
			// changing fireEvent recognitionf of skipping the initiator component
			// would break base/Button behavior, so this trick is used to make it work along
			evtData.__src = parentComp;

			if(evtData.name && !evtData.cancelClick){
				parentComp.fireEvent(evtData);
			} 

		}catch(e){
			j6x.logError('problem activating click',evt, {target:evt.target,parent:parentComp});
			throw e;
		}	
	});
}

j6x.registerDirective('x-click', function(el, comp, options, updaters, parentComp){
	if(comp) throw new Error('x-click not supported on component nodes');
	j6x._xClickListen(el, options, updaters, parentComp);
});

})(j6x);