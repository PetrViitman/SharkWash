<script setup>
	import Indicator from './Indicator.vue'
	import { ref } from 'vue'

	const emit = defineEmits(['selected'])
	const props = defineProps({
		isDecorated: {
			type: Boolean,
			default: true
		},
		selectableValues: {
			type: Array,
			default: []
		},
		captionText: String,
		indicatorValue: String
	})

	const index = ref(0)

	function previousValue() {
		index.value = Math.max(0, index.value - 1)
		emit('selected', index.value)
	}

	function nextValue() {
		index.value = Math.min(
			props.selectableValues.length - 1,
			index.value + 1)

		emit('selected', index.value)
	}

	function setSelectedValue(value) {
		const newIndex = props.selectableValues.indexOf(value)
		index.value = newIndex > 0 ? newIndex : 0
	}

	defineExpose({ setSelectedValue })
</script>

<template scoped>
	<Indicator
		id="betSelector"
		:width = "150"
		:captionText = "captionText"
		:indicatorValue = "selectableValues[index]">
		<div
			:class="{ disabled: !index }"
			@click="previousValue"
			class="button left"
			v-show="isDecorated">
			-
		</div>
		<div
			:class="{ disabled: index >= selectableValues.length - 1}"
			@click="nextValue"
			class="button right"
			v-show="isDecorated">
			+
		</div>
	</Indicator>
</template>

<style scoped>
	.button{
		text-align: center;
		width: 30px;
		height: 30px;
		font-size: 25px;
		background-color: rgba(255, 255, 255, 0.1);
		border-radius: 15px;
		position: absolute;
	}

	.button.disabled {
	  pointer-events: none;
	  opacity: 0.25;
	  color: #444444;
	}

	.button:hover {
	  color: white;
	  cursor: pointer;
	  background-color: rgba(255, 255, 255, 0.25);
	}

	.button.left {
		top: 10px;
		left: 5px;
	}

	.button.right {
		top: 10px;
		right: 5px;
	}
</style>
