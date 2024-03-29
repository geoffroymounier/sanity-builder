import React from 'react';
import { write, read } from 'clipboardy';
import DropDownButton from 'part:@sanity/components/buttons/dropdown';
import Button from 'part:@sanity/components/buttons/default';
import DefaultArrayFunctions from 'part:@sanity/form-builder/input/array/functions-default';
import updateKeys from './updateKeys';


const useInterval = (callback, delay) => {
  const savedCallback = React.useRef();
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


export default function DuplicateArrayFunctions(props) {
  const { type, value, onAppendItem } = props;
  const [copiedItem, setCopiedItem] = React.useState(null)

  const readData = async () => {
    const data = await read()
    if (data) {
      setCopiedItem(JSON.parse(data))
    } else {
      setCopiedItem(null)
    }
  }

  const handleDuplicateBtnClick = ({ item }) => {
    const newItem = item.hasOwnProperty('_key')
      ? updateKeys(Object.assign({}, item), '_key')
      : item;
    onAppendItem(newItem);
  };

  const handleCopy = ({ item }) => {
    write(JSON.stringify(item))
  };

  useInterval(() => {
    if (!copiedItem) {
      readData()
    }

  }, [1000])



  const items = field => {
    if (Array.isArray(field)) {
      console.log(" You've passed an array in to the duplicate function! These aren't supported yet")
      return []
    }

    // If there is no canDuplicate value, or there are no array items, return empty array
    if (field === undefined || value === undefined) {
      return [];
    }

    return value
      // Filter out references
      .filter(item => item._type !== 'reference')
      // Map remaining items
      .reduce((array, item) => {
        // If canDuplicate passes a value which doesn't correspond to a field, try alternatives:
        if (item[field] === undefined) {
          // Test to see if item can be rendered as is
          if (typeof item === 'string' || typeof item === 'number') {
            array.push({
              title: item,
              item
            })
          }

          // Test for common fields instead
          if (item.name || item.title || item.text || item.header || item.id || item.current || item.description) {
            array.push({
              title: item.name || item.title || item.text || item.header || item.id || item.current || item.description,
              item
            });
          } else {
            // Otherwise push nothing
            console.log(
              'The array duplication function cannot find your field to render children. Please check your schema.'
            );
          }
          return array;
        }

        array.push({
          title: item[field],
          item
        });

        return array;
      }, []);
  };

  const itemArray = items(type?.options?.canDuplicate);
  return (
    <DefaultArrayFunctions {...props}>
      {itemArray.length > 0 && (
        <>
          <DropDownButton
            inverted
            items={itemArray}
            onAction={handleDuplicateBtnClick}
          >
            Duplicate
        </DropDownButton>
          <DropDownButton
            inverted
            items={itemArray}
            onAction={handleCopy}
          >
            Copy
      </DropDownButton>
          {copiedItem && <Button
            inverted
            onClick={() => {
              handleDuplicateBtnClick({ item: copiedItem })
              write('')
              setCopiedItem(null)
            }}
          >
            Paste
          </Button>}
        </>
      )}
    </DefaultArrayFunctions>
  );
}
