<template>
  <div id="app">

    <hsc-window-style-white>
        <hsc-window v-if="selectedCell" :isOpen.sync="selected.length > 0" title="Cell">
            {{selected[0].id}}
            <fieldset>
                <legend>Cell Height</legend>
                <input @input="setCellHeight($event)" :value="selected[0].size" :min="1.25" :step="1.25" :max="12.5" type="range" />
            </fieldset>
            <fieldset>
                <legend>Cell Color</legend>
                <chrome-picker :value="selected[0].style.top" @input="setCellColor($event)" />
            </fieldset>
            <fieldset>
                <legend>Cell Cut</legend>
                None: <input type="radio" :checked="selected[0].cut == 'none'" name="rad" @input="setCellCut($event)" value="none"/><br/>
                Front: <input type="radio" :checked="selected[0].cut == 'front'" name="rad" @input="setCellCut($event)" value="front"/><br/>
                Back: <input type="radio" :checked="selected[0].cut == 'back'" name="rad" @input="setCellCut($event)" value="back"/><br/>
                Left: <input type="radio" :checked="selected[0].cut == 'left'" name="rad" @input="setCellCut($event)" value="left"/><br/>
                Right: <input type="radio" :checked="selected[0].cut == 'right'" name="rad" @input="setCellCut($event)" value="right"/>
            </fieldset>
        </hsc-window>
    </hsc-window-style-white>


    <svg @mousemove="updateMouse" id="stage">

      <defs>
        <filter id='active' x='-50%' y='-50%' width='200%' height='200%'>
          <!--inside-stroke-->
          <feFlood flood-color="yellow" result="inside-color"/>
          <feComposite in2="SourceAlpha" operator="in" result="inside-stroke"/>
          <!--fill-area-->
          <feMorphology in="SourceAlpha" operator="erode" radius="3"/>
          <feComposite in="SourceGraphic" operator="in" result="fill-area"/>
          <!--merge graphics-->
          <feMerge>
            <feMergeNode in="inside-stroke"/>
            <feMergeNode in="fill-area"/>
          </feMerge>
        </filter>
        <filter id='selected' x='-50%' y='-50%' width='200%' height='200%'>
          <!--inside-stroke-->
          <feFlood flood-color="hotpink" result="inside-color"/>
          <feComposite in2="SourceAlpha" operator="in" result="inside-stroke"/>
          <!--fill-area-->
          <feMorphology in="SourceAlpha" operator="erode" radius="3"/>
          <feComposite in="SourceGraphic" operator="in" result="fill-area"/>
          <!--merge graphics-->
          <feMerge>
            <feMergeNode in="inside-stroke"/>
            <feMergeNode in="fill-area"/>
          </feMerge>
        </filter>
      </defs>

      <g :transform="'translate('+(width/2)+' '+(height/2)+')'" v-for="(c, i) in cells" :key="'cell_'+i">
      <g :transform="'translate('+((c.x - c.y) * cellWidth / 2)+' '+((c.x + c.y) * cellHeight / 2)+')'">

        <!-- Flat -->
        <g>
        <!-- Flat Top -->
        <polygon vector-effect="non-scaling-stroke" shape-rendering="geometricPrecision" v-if="c.cut === 'none'"
          :points='
          `0,${-c.size * cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2 -  c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} `
          '
          :fill="c.style.top"
          stroke="black"
          stroke-width="1"
          :filter="c.id == selectedCell ? 'url(#selected)' : c.id == activeCell ? 'url(#active)' : ''"

          @mouseover="setActiveCell(c)"
          @mouseleave="activeCell = null"
          @click="setSelectedCell(c)"
        ></polygon>
        <!-- Flat Left -->
        <polygon v-if="c.cut === 'none'"
          :points='
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `0,${cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.left"
          stroke="black"
        ></polygon>
        <!-- Flat Right -->
        <polygon v-if="c.cut === 'none'"
          :points='
          `${cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `0,${cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.right"
          stroke="black"
        ></polygon>
        </g>
        <!-- End Flat -->



        <!-- CF -->
        <g>
        <!-- CF Top -->
        <polygon v-if="c.cut === 'front'"
          :points='
          `0,${-c.size * cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2 -  c.size * cellHeight + cutSize} ` +
          `0,${(cellHeight - c.size * cellHeight) + cutSize} ` +
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight}`
          '
          :fill="c.style.top"
          stroke="black"
          strokeWidth="1"
          :filter="c.id == selectedCell ? 'url(#selected)' : c.id == activeCell ? 'url(#active)' : ''"

          @mouseover="setActiveCell(c)"
          @mouseleave="activeCell = null"
          @click="setSelectedCell(c)"
        ></polygon>
        <!-- CF Left -->
        <polygon v-if="c.cut === 'front'"
          :points='
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.left"
          stroke="black"
        ></polygon>
        <!-- CF Right -->
        <polygon v-if="c.cut === 'front'"
          :points='
          `${cellWidth / 2},${cellHeight / 2 - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.right"
          stroke="black"
        ></polygon>
        </g>
        <!-- End CF -->

        <!-- CL -->
        <g>
        <!-- CL Top -->
        <polygon v-if="c.cut === 'left'"
          :points='
          `0,${-c.size * cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2 -  c.size * cellHeight} ` +
          `0,${(cellHeight - c.size * cellHeight + cutSize)} ` +
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight + cutSize}`
          '
          :fill="c.style.top"
          stroke="black"
          strokeWidth="1"
          :filter="c.id == selectedCell ? 'url(#selected)' : c.id == activeCell ? 'url(#active)' : ''"

          @mouseover="setActiveCell(c)"
          @mouseleave="activeCell = null"
          @click="setSelectedCell(c)"
        ></polygon>
        <!-- CL Left -->
        <polygon v-if="c.cut === 'left'"
          :points='
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.left"
          stroke="black"
        ></polygon>
        <!-- CL Right -->
        <polygon v-if="c.cut === 'left'"
          :points='
          `${cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight + cutSize} ` +
          `0,${cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.right"
          stroke="black"
        ></polygon>
        </g>
        <!-- End CL -->

        <!-- CR -->
        <g>
        <!-- CR Top -->
        <polygon v-if="c.cut === 'right'"
          :points='
          `0,${-c.size * cellHeight  + cutSize} ` +
          `${cellWidth / 2},${cellHeight / 2 -  c.size * cellHeight  + cutSize } ` +
          `0,${(cellHeight - c.size * cellHeight)} ` +
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight }`
          '
          :fill="c.style.top"
          stroke="black"
          strokeWidth="1"
          :filter="c.id == selectedCell ? 'url(#selected)' : c.id == activeCell ? 'url(#active)' : ''"

          @mouseover="setActiveCell(c)"
          @mouseleave="activeCell = null"
          @click="setSelectedCell(c)"
        ></polygon>
        <!-- CR Left -->
        <polygon v-if="c.cut === 'right'"
          :points='
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight } ` +
          `0,${cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.left"
          stroke="black"
        ></polygon>
        <!-- CR Right -->
        <polygon v-if="c.cut === 'right'"
          :points='
          `${cellWidth / 2},${cellHeight / 2 - c.size * cellHeight  + cutSize} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `0,${cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2 }`
          '
          :fill="c.style.right"
          stroke="black"
        ></polygon>
        </g>
        <!-- End CR -->

        <!-- CB -->
        <g>
        <!-- CB Top -->
        <polygon v-if="c.cut === 'back'"
          :points='
          `0,${-c.size * cellHeight  + cutSize} ` +
          `${cellWidth / 2},${cellHeight / 2 -  c.size * cellHeight} ` +
          `0,${(cellHeight - c.size * cellHeight )} ` +
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight  + cutSize}`
          '
          :fill="c.style.top"
          stroke="black"
          strokeWidth="1"
          :filter="c.id == selectedCell ? 'url(#selected)' : c.id == activeCell ? 'url(#active)' : ''"
          
          @mouseover="setActiveCell(c)"
          @mouseleave="activeCell = null"
          @click="setSelectedCell(c)"
        ></polygon>
        <!-- CB Left -->
        <polygon v-if="c.cut === 'back'"
          :points='
          `${-cellWidth / 2},${cellHeight / 2 - c.size * cellHeight  + cutSize} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `0,${cellHeight} ` +
          `${-cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.left"
          stroke="black"
        ></polygon>
        <!-- CB Right -->
        <polygon v-if="c.cut === 'back'"
          :points='
          `${cellWidth / 2},${cellHeight / 2 - c.size * cellHeight} ` +
          `0,${cellHeight - c.size * cellHeight} ` +
          `0,${cellHeight} ` +
          `${cellWidth / 2},${cellHeight / 2}`
          '
          :fill="c.style.right"
          stroke="black"
        ></polygon>
        </g>
        <!-- End CB -->

      </g>
    
      </g>
    </svg>
  </div>
</template>

<script>
import Color from 'color';
import { Chrome } from 'vue-color'
import { SVG } from '@svgdotjs/svg.js';
require('./assets/js/svg.panzoom');

export default {
  name: 'app',
  data () {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      draw: null,
      mouse: {
        x: 0,
        y: 0,
      },
      cells: [],
      gridSize: 12,
      cellWidth: 50,
      cellHeight: 25,
      cellSize: 1.25,
      cellStrength: 0,
      cutSize: 31,
      activeCell: null,
      selectedCell: null
    }
  },
  mounted () {
    this.draw = SVG('#stage').size(this.width, this.height);
    this.resize();

    this.init();

    window.addEventListener('resize', () => {
      this.resize();
    });
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  },
  methods: {
    resize () {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.draw.size(this.width, this.height);
      this.draw.viewbox(0,0,this.width, this.height);
      this.draw.panZoom({panMouse: 3});
    },
    updateMouse (event) {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
    },
    init () {
      for (let x = 0; x < this.gridSize; x++) {
        for (let y = 0; y < this.gridSize; y++) {
          let z = this.cellSize;
          this.cells.push({
            id: 'block_'+x+'_'+y,
            x: x,
            y: y,
            z: z,
            style: {
              top: '#9abe63',
              left: new Color('#9abe63').darken(0.2).hex().toString(),
              right: new Color('#9abe63').darken(0.4).hex().toString()
            },
            size: 1.25,
            strength: 0,
            cut: 'none'
          })
        }
      }
    },
    setActiveCell(cell) {
      this.activeCell = cell.id;
    },
    setSelectedCell(cell) {
      if (this.selectedCell == cell.id) {
        this.selectedCell = null;
        return;
      }
      this.selectedCell = cell.id;
    },
    setCellHeight(event) {
      let cell = this.cells.filter((cell) => cell.id == this.selectedCell)[0];
      cell.size = event.target.value;
    },
    setCellColor(event) {
      let cell = this.cells.filter((cell) => cell.id == this.selectedCell)[0];
      cell.style.top = event.hex;
      cell.style.left = new Color(event.hex).darken(0.2).hex().toString();
      cell.style.right = new Color(event.hex).darken(0.4).hex().toString();
    },
    setCellCut (event) {
      let cell = this.cells.filter((cell) => cell.id == this.selectedCell)[0];
      cell.cut = event.target.value;
    }
   },
   computed: {
     selected () {
       return this.cells.filter((cell) => cell.id == this.selectedCell);
     },
     active () {
       return this.cells.filter((cell) => cell.id == this.activeCell);
     }
   },
    components: {
      'chrome-picker': Chrome
    }
}
</script>
<style scoped>
  polygon {
    paint-order: stroke;
    
  }
</style>