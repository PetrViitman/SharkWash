<script setup>
	import { ref, onUpdated, onMounted, nextTick } from 'vue'
	const contentContainer = ref(null)
	const props =  defineProps({
		maximalWidth: Number,
		maximalHeight: Number,
		layoutX: String,
		layoutY: String,
   })

	function revalidate() {
		const htmlElement = contentContainer.value
		const { clientWidth, clientHeight } = htmlElement
		const { maximalWidth, maximalHeight } = props
		const scaleX = Math.min(1, maximalWidth / clientWidth)
		const scaleY = Math.min(1, maximalHeight / clientHeight)
		const scale = Math.min(scaleX, scaleY)
		const leftoverX = maximalWidth - clientWidth * scale
		const leftoverY = maximalHeight - clientHeight * scale
		const layoutX = props.layoutX ?? 'left'
		const layoutY = props.layoutY ?? 'top'

		let offsetX
		let offsetY

		switch (layoutX) {
			case 'left': offsetX = 0; break
			case 'center': offsetX = leftoverX / 2; break
			case 'right': offsetX = leftoverX; break
		}

		switch (layoutY) {
			case 'top': offsetY = 0; break
			case 'middle': offsetY = leftoverY / 2; break
			case 'bottom': offsetY = leftoverY; break
		}

		htmlElement.style.transform = `
		  scaleX(${scale})
		  scaleY(${scale})`;

		htmlElement.style.left = offsetX + 'px'
		htmlElement.style.top = offsetY + 'px'
	}

	onUpdated(() => { nextTick(revalidate()) })
	onMounted(() => { nextTick(revalidate()) })
</script>

<template>
	<div class="body" ref="body">
		<div class="content-container" ref="contentContainer">
			<slot></slot>
		</div>
	</div>
</template>

<style scoped>
.body{
	width: v-bind(maximalWidth)  + 'px';
	height: v-bind(maximalHeight) + 'px';

	position: absolute;
	top: 0px;
	left: 0px;
	transform-origin: center middle;
	transform: scaleX(1) scaleY(1);
}
.content-container{
	position: absolute;
	transform-origin: left top;
	white-space: nowrap;
}

</style>
  