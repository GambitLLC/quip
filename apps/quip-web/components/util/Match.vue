<script>
export default {
  props: ['match'],
  setup(props, {slots}) {
    return () => render(props, slots);
  }
}

function render(props, slots) {
  let matches = [];
  let defaults = [];
  for (let child of slots.default()) {
    if (child.props?.case === props.match) {
      matches.push(child)
    }
    if (child.props?.case === undefined) {
      defaults.push(child)
    }
  }
  return matches.length > 0 ? matches : defaults
}
</script>
