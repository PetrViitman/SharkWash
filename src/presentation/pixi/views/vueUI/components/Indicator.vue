<script setup>
	import TextField from './TextField.vue'
	import { computed } from 'vue'
	const props = defineProps({
		width: Number,
		textFieldWidth: Number,
		indicatorValue: String | Number,
		captionText: String,
	})

	const textFieldOffsetX = computed(() => ((props.width - props.textFieldWidth) / 2) + 'px')
</script>

<template scoped>
	<div class="background">
		<TextField
			class="value text-field"
			:layoutX="'center'"
			:layoutY="'middle'"
			:maximalWidth = textFieldWidth
			:maximalHeight = "captionText ? 30 : 60">
			{{ indicatorValue }}
		</TextField>
		<TextField
			v-show="captionText"
			class="caption text-field"
			:layoutX="'center'"
			:layoutY="'middle'"
			:maximalWidth = textFieldWidth
			:maximalHeight = 30>
			{{ captionText }}
		</TextField>
		<slot></slot>
	</div>
</template>

<style scoped>
	.background{
		position: absolute;
		width: v-bind(width + 'px');
		height: 50px;
	}
	.text-field {
		left: v-bind(textFieldOffsetX);
	}

	.text-field.value {
		font-size: v-bind("captionText ? '17px' : '30px'");
		top: v-bind("captionText ? '0px' : '-5px'");
	}

	.caption {
		top: 20px;
		color: #00B1A9;
	}

	.background.decorated{
		background: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, .5)), to(rgba(42, 42, 42, .5)));
		background: linear-gradient(180deg, rgba(0, 0, 0, .5), rgba(42, 42, 42, .5));
		border-radius: 28px;
		-webkit-box-shadow: 0px 2px rgba(255, 255, 255, 0.08627);
		box-shadow: 0px 2px rgba(255, 255, 255, 0.08627);
	}
</style>
