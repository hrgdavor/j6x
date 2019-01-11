describe( 'x-click', function () { 
	var h = j6x.h;
	var t = j6x.t;

	j6x.addCompClass('test.XClickTestJsx', 'Base',
	function(h,t,proto, superProto, comp, superComp){

		proto.on_save = function(evt){
			this.saveContext = evt.context;
			this.saveAction = evt.action;
		};

		proto.template = function(state, params, self){
			return <template>
				<b x-click={(evt,action)=>{return 11;}} action="aaaa" event="save"/>
				<div x-click="save">
					<button action="b1">b1</button>
					<button action="b2">b2</button>
					<button action="b3" disabled>b3</button>
				</div>
			</template>;
		};

	});

	it(' / x-click node', function () {
		var comp = j6x.addComp(null, <b as="test.XClickTestJsx"/>);
		
		comp.el.firstChild.click();

		expect(comp.saveContext).toEqual(11);
		expect(comp.saveAction).toEqual('aaaa');

		console.log(comp.el.firstChild.nextSibling);
		var bt1 = comp.el.firstChild.nextSibling.firstElementChild;
		bt1.click();
		expect(comp.saveAction).toEqual('b1');

		var bt2 = bt1.nextSibling;
		bt2.click();
		expect(comp.saveAction).toEqual('b2');

		var bt3 = bt2.nextSibling;
		bt3.click();
		// no change as b3 is disabled
		expect(comp.saveAction).toEqual('b2');

	});

});