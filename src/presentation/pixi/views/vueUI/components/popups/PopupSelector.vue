<script setup>
	import Selector from '../Selector.vue';
	import TextField from '../TextField.vue'
	import { ref } from 'vue'

	const selectedIndex = ref(0)
	const emit = defineEmits(['confirm', 'close'])
	const props =  defineProps({
		isSimplifiedMode: Boolean,
		messageText: String,
		buttonText: String,
		selectableValues: Array,
		selectableCaptionValues: {
			type: Array,
			default: []
		},
		selectorCaptionText: String,
	})

	function onValueSelected(index) {
		selectedIndex.value = index
	}
</script>

<template>
	<div>
		<div class="body-background"> </div>
		<TextField
			class="message-text"
			:maximalWidth="250"
			:maximalHeight="20"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ messageText }}
		</TextField>
		<TextField
			@click="emit('confirm', selectedIndex)"
			class="button"
			:maximalWidth="80"
			:maximalHeight="40"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ buttonText }}
		</TextField>
		<Selector
			class="decorated selector"
			@selected="(index) => onValueSelected(index)"
			:isDecorated = "!isSimplifiedMode"
			:width = "200"
			:textFieldWidth = "100"
			:selectableValues = "selectableValues"
			:captionText = "selectorCaptionText ?? selectableCaptionValues[selectedIndex]">
		</Selector>
		<div
			@click="emit('close')"
			class="button-close">
			✕
		</div>
	</div>
</template>

<style scoped>
	.body-background{
		width: 300px;
		height: 200px;
		border-radius: 15px;
		background: -webkit-gradient(linear, left bottom, left top, from(rgba(0, 0, 0, .8)), to(rgba(41, 41, 41, .8)));
		background: linear-gradient(to top, rgba(0, 0, 0, .8) 0%, rgba(41, 41, 41, .8) 100%);
		border-top: 1px solid #515253;
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
	}

	.message-text {
		width: 250px;
		height: 20px;
		left: 25px;
		top: 40px;
		text-align: center;
	}

	.selector{
		top: 65px;
		left: 50px;
	}

	.button {
		position: absolute;
		left: 112px;
		top: 125px;
		width: 80px;
		height: 40px;
		background:#b3b3b3;
		border-radius: 10px;
		color: black;
	}

	.button:hover {
		background:#00B1A9;
		cursor: pointer;
	}

	.button-close{
		border-top: 1px solid #515253;
		top: 5px;
		right: 5px;
		text-align: center;
		width: 25px;
		height: 25px;
		font-size: 17px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		position: absolute;
	}

	.button-close.disabled{
		pointer-events: none;
		opacity: 0.5;
	}

	.button-close:hover {
		border-top: 1px solid white;
		color: white;
		cursor: pointer;
		background-color: rgba(255, 255, 255, 0.25);
	}

</style>