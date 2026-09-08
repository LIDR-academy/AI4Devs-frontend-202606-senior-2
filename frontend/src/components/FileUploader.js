import React, { useState } from 'react';
import { Button, HStack, Input, Spinner, Stack, Text } from '@chakra-ui/react';

// Restyled from react-bootstrap to Chakra + theme tokens. State and the upload call are unchanged.

const FileUploader = ({ onChange, onUpload }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
    onChange(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('http://localhost:3010/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error('Error al subir archivo');
        }

        const fileData = await res.json();
        setFileData(fileData);
        onUpload(fileData);
      } catch (error) {
        console.error('Error al subir archivo:', error);
      } finally {
        setLoading(false); // Asegura que loading se establezca a false después de la operación
      }
    }
  };

  return (
    <Stack spacing={2} align="flex-start">
      <HStack spacing={2} w="full">
        <Input
          type="file"
          onChange={handleFileChange}
          aria-label="File"
          pt={1}
        />
        <Button variant="secondary" onClick={handleFileUpload} flexShrink={0}>
          {loading ? (
            <Spinner size="sm" />
          ) : (
            'Subir Archivo'
          )}
        </Button>
      </HStack>
      <Text textStyle="bodySm" color="text.subdue">Selected file: {fileName}</Text>
      {fileData && (
        <Text textStyle="bodySm" color="text.success">
          Archivo subido con éxito
        </Text>
      )}
    </Stack>
  );
};

export default FileUploader;
